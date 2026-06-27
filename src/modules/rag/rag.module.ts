import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { PromptBuilderService } from './services/prompt-builder.service';
import { RagService } from './services/rag.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { RetrivalService } from './services/retrieval.service';
import { EmbeddingService } from '../embedding/service/embedding.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [EmbeddingModule, PrismaModule, AnalyticsModule],
  controllers: [RagController],
  providers: [RagService, RetrivalService, PromptBuilderService, EmbeddingService],
  exports: [RagService]
})
export class RagModule {}
