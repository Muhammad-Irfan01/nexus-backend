import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './services/documents.service';
import { DocumentQueueService } from './queue/document.queue.service';
import { ChunkingService } from './services/chunking.service';
import { TextExtractionService } from './services/text-extraction.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { DocumentProcessor } from './queue/document.processor';
import { EmbeddingModule } from '../embedding/embedding.module';
import { SupabaseStorageService } from './services/supabase-storage.service';
import { QStashModule } from '../../common/qstash/qstash.module';
import { DocumentWebhookController } from './webhooks/document-webhook.controller';

@Module({
  imports: [AnalyticsModule, EmbeddingModule, QStashModule],
  providers: [DocumentsService, DocumentQueueService, TextExtractionService, ChunkingService, DocumentProcessor, SupabaseStorageService],
  controllers: [DocumentsController, DocumentWebhookController]
})
export class DocumentsModule {}
