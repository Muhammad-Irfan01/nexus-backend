import { Module } from '@nestjs/common';
import { EmbeddingService } from './service/embedding.service';
import { EmbeddingsController } from './embedding.controller';
import { QdrantService } from './service/qdrant.service';
import { EmbeddingQueueService } from './queues/embeddings.queue.service';
import { EmbeddingsProcessor } from './queues/embeddings.processor';

@Module({
  providers: [EmbeddingService, QdrantService, EmbeddingQueueService, EmbeddingsProcessor],
  controllers: [EmbeddingsController],
  exports: [EmbeddingQueueService, QdrantService],
})
export class EmbeddingModule {}
