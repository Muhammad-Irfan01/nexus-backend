import { Module } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './analytics.controller';
import { UsageTrackerService } from './services/usage-tracker.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  // imports: [PrismaService],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, UsageTrackerService],
  exports: [AnalyticsService, UsageTrackerService],
})
export class AnalyticsModule {}
