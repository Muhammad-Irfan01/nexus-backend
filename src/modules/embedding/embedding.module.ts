import { Module } from '@nestjs/common';
import { EmbeddingService } from './service/embedding.service';
import { EmbeddingsController } from './embedding.controller';
import { QdrantService } from './service/qdrant.service';
import { EmbeddingQueueService } from './queues/embeddings.queue.service';

@Module({
  providers: [EmbeddingService, QdrantService, EmbeddingQueueService],
  controllers: [EmbeddingsController],
  exports: [EmbeddingQueueService, QdrantService],
})
export class EmbeddingModule {}
