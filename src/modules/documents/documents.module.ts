import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './services/documents.service';
import { DocumentQueueService } from './queue/document.queue.service';
import { ChunkingService } from './services/chunking.service';
import { TextExtractionService } from './services/text-extraction.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [AnalyticsModule],
  providers: [DocumentsService, DocumentQueueService, TextExtractionService, ChunkingService],
  controllers: [DocumentsController]
})
export class DocumentsModule {}
