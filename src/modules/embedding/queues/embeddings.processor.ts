import { PrismaService } from "../../../prisma/prisma.service";
import { QdrantService } from "../service/qdrant.service";
import {Redis} from 'ioredis';

import { Worker, Job, Queue } from "bullmq";
import { EMBEDDINGS_QUEUE } from "../constants/embeddings.constants";
import { EmbeddingService } from "../service/embedding.service";


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
  },
});
  }
  async process(documentId: string) {
    const chunks =
      await this.prisma.documentChunk.findMany({
        where: { documentId },
      });

    for (const chunk of chunks) {
      try {
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
        await this.prisma.documentChunk.update({
          where: { id: chunk.id },
          data: {
            embeddingStatus: 'FAILED',
          },
        });
      }
    }
  }
}