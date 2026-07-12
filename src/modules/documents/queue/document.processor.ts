import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { Injectable } from '@nestjs/common';


import { TextExtractionService }
  from '../services/text-extraction.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { DOCUMENT_QUEUE } from '../constant/document.constants';
import { ChunkingService } from '../services/chunking.service';
import { EmbeddingQueueService } from '../../embedding/queues/embeddings.queue.service';


@Injectable()
export class DocumentProcessor {
  constructor(
    private prisma: PrismaService,
    private extractor: TextExtractionService,
    private chunkingservice: ChunkingService,
    private embeddingQueueService: EmbeddingQueueService
  ) {
    new Worker(
      DOCUMENT_QUEUE,
      async (job: Job) => {
        await this.process(job.data.documentId);
      },
      {
        connection: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          maxRetriesPerRequest: null,
        },
      },
    );
  }

  async process(
    documentId: string,
  ) {
    console.log(`[DEBUG] DocumentProcessor.process: starting documentId=${documentId}`);
    const document =
      await this.prisma.document.findUnique({
        where: { id: documentId },
      });

    if (!document) {
      console.log(`[DEBUG] DocumentProcessor.process: document not found documentId=${documentId}`);
      return;
    }

    try {
      console.log(`[DEBUG] DocumentProcessor.process: updating status to PROCESSING`);
      await this.prisma.document.update({
        where: { id: document.id },
        data: {
          status: 'PROCESSING',
        },
      });

      const text =
        await this.extractor.extractText(
          document.storagePath,
          document.mimeType,
        );
      console.log(`[DEBUG] DocumentProcessor.process: text extracted`);

      const chunks = this.chunkingservice.splitText(text);
      console.log(`[DEBUG] DocumentProcessor.process: text split into ${chunks.length} chunks`);

      await this.prisma.documentChunk.deleteMany({
        where: {
          documentId: document.id,
        },
      });

      await this.prisma.documentChunk.createMany({
        data: chunks.map(
          (chunk, index) => ({
            documentId: document.id,

            chunkIndex: index,

            content: chunk,

            tokenCount:
              this.chunkingservice.estimateTokens(
                chunk,
              ),
          })
        ),
      });

      // Enqueue embedding job only AFTER chunks are persisted,
      // otherwise the worker can pick up the job before the rows exist
      // and silently process zero chunks (no error is thrown either way).
      await this.embeddingQueueService.addJob(document.id);
      console.log(`[DEBUG] DocumentProcessor.process: embedding job added`);


      await this.prisma.document.update({
        where: { id: document.id },
        data: {
          extractedText: text,
          status: 'READY',
          processedAt: new Date(),
        },
      });
      console.log(`[DEBUG] DocumentProcessor.process: finished documentId=${documentId}`);
    } catch (error) {
      console.error(`[DEBUG] DocumentProcessor.process: error documentId=${documentId}`, error);
      await this.prisma.document.update({
        where: { id: document.id },
        data: {
          status: 'FAILED',
        },
      });

      throw error;
    }
  }

}