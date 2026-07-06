import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './services/documents.service';
import { DocumentQueueService } from './queue/document.queue.service';
import { ChunkingService } from './services/chunking.service';
import { TextExtractionService } from './services/text-extraction.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { DocumentProcessor } from './queue/document.processor';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [AnalyticsModule, EmbeddingModule],
  providers: [DocumentsService, DocumentQueueService, TextExtractionService, ChunkingService, DocumentProcessor],
  controllers: [DocumentsController]
})
export class DocumentsModule {}
