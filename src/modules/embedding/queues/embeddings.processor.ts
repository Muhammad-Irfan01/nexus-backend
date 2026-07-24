import { PrismaService } from "../../../prisma/prisma.service";
import { QdrantService } from "../service/qdrant.service";
import { Redis } from 'ioredis';
import { Injectable } from "@nestjs/common";

import { Worker, Job, Queue } from "bullmq";
import { EMBEDDINGS_QUEUE } from "../constants/embeddings.constants";
import { EmbeddingService } from "../service/embedding.service";


@Injectable()
export class EmbeddingsProcessor {
  private queue: Queue;

  constructor(
    private prisma: PrismaService,
    private embeddings: EmbeddingService,
    private qdrant: QdrantService,
  ) {
    this.queue = new Queue(EMBEDDINGS_QUEUE, {
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    });
    new Worker(
      EMBEDDINGS_QUEUE,
      async (job: Job) => {
        await this.process(job.data.documentId);
      },
      {
        connection: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD,
          maxRetriesPerRequest: null,
        },
      },
    );
  }
  async process(documentId: string) {
    console.log(`[DEBUG] EmbeddingsProcessor.process: starting documentId=${documentId}`);
    const chunks =
      await this.prisma.documentChunk.findMany({
        where: { documentId },
      });

    if (chunks.length === 0) {
      // Don't silently "succeed" with nothing to do — this usually means
      // the job ran before chunks were persisted, or extraction produced
      // no text. Throwing lets BullMQ's attempts/backoff actually retry.
      console.error(`[DEBUG] EmbeddingsProcessor.process: no chunks found for documentId=${documentId}`);
      throw new Error(`No document chunks found for document ${documentId}`);
    }

    for (const chunk of chunks) {
      try {
        console.log(`[DEBUG] EmbeddingsProcessor.process: processing chunk=${chunk.id}`);
        await this.prisma.documentChunk.update({
          where: { id: chunk.id },
          data: {
            embeddingStatus: 'PROCESSING',
          },
        });

        const vector =
          await this.embeddings.generateEnbedding(
            chunk.content,
          );

        const pointId = chunk.id;

        await this.qdrant.upsertVector(
          pointId,
          vector,
          {
            documentId: chunk.documentId,
            chunkId: chunk.id,
            content: chunk.content,
          },
        );

        await this.prisma.documentChunk.update({
          where: { id: chunk.id },
          data: {
            embeddingStatus: 'COMPLETED',
            qdrantPointId: pointId,
          },
        });
      } catch (err) {
        console.error(`[DEBUG] EmbeddingsProcessor.process: error chunk=${chunk.id}`, err);
        await this.prisma.documentChunk.update({
          where: { id: chunk.id },
          data: {
            embeddingStatus: 'FAILED',
          },
        });
      }
    }
    console.log(`[DEBUG] EmbeddingsProcessor.process: finished documentId=${documentId}`);
  }
}