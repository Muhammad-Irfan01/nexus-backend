import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { agentService } from './services/agent.service';
import { AgentExecutorService } from './services/agent-executor.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RagModule } from '../rag/rag.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [PrismaModule, RagModule, AnalyticsModule],
  controllers: [AgentsController],
  providers: [agentService, AgentExecutorService],
  exports: [agentService, AgentExecutorService]
})
export class AgentsModule {}
