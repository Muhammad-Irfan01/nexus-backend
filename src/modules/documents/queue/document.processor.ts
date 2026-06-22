import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';


import { TextExtractionService }
  from '../services/text-extraction.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { DOCUMENT_QUEUE } from '../constant/document.constants';
import { ChunkingService } from '../services/chunking.service';



export class DocumentProcessor {
  constructor(
    private prisma: PrismaService,
    private extractor: TextExtractionService,
    private chunkingservice: ChunkingService
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
    const document =
      await this.prisma.document.findUnique({
        where: { id: documentId },
      });

    if (!document) {
      return;
    }

    try {
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

      const chunks = this.chunkingservice.splitText(text);

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


      await this.prisma.document.update({
        where: { id: document.id },
        data: {
          extractedText: text,
          status: 'READY',
          processedAt: new Date(),
        },
      });
    } catch (error) {
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