import { PrismaService } from "../../../prisma/prisma.service";
import { QdrantService } from "../service/qdrant.service";
import { Injectable } from "@nestjs/common";
import { EmbeddingService } from "../service/embedding.service";


@Injectable()
export class EmbeddingsProcessor {

  constructor(
    private prisma: PrismaService,
    private embeddings: EmbeddingService,
    private qdrant: QdrantService,
  ) {}

  async process(documentId: string) {
    console.log(`[DEBUG] EmbeddingsProcessor.process: starting documentId=${documentId}`);
    const chunks =
      await this.prisma.documentChunk.findMany({
        where: { documentId },
      });

    if (chunks.length === 0) {
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
        console.log(`[DEBUG] EmbeddingsProcessor.process: generated embedding for chunk=${chunk.id}`);

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
        console.log(`[DEBUG] EmbeddingsProcessor.process: upserted to Qdrant for chunk=${chunk.id}`);

        await this.prisma.documentChunk.update({
          where: { id: chunk.id },
          data: {
            embeddingStatus: 'COMPLETED',
            qdrantPointId: pointId,
          },
        });
        console.log(`[DEBUG] EmbeddingsProcessor.process: marked completed in DB for chunk=${chunk.id}`);
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