import { Module } from '@nestjs/common';
import { EmbeddingService } from './service/embedding.service';
import { EmbeddingsController } from './embedding.controller';
import { QdrantService } from './service/qdrant.service';
import { EmbeddingQueueService } from './queues/embeddings.queue.service';
import { EmbeddingsProcessor } from './queues/embeddings.processor';
import { QStashModule } from '../../common/qstash/qstash.module';
import { EmbeddingsWebhookController } from './webhooks/embeddings-webhook.controller';

@Module({
  imports: [QStashModule],
  providers: [EmbeddingService, QdrantService, EmbeddingQueueService, EmbeddingsProcessor],
  controllers: [EmbeddingsController, EmbeddingsWebhookController],
  exports: [EmbeddingQueueService, QdrantService],
})
export class EmbeddingModule {}
