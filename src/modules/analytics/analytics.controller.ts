import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':workspaceId/overview')
  async getOverview(@CurrentUser('id') userId: string, @Param('workspaceId') workspaceId: string) {
    return this.analyticsService.getOverview(userId, workspaceId);
  }

  @Get(':workspaceId/recent-activity')
  async recentActivity(@CurrentUser('id') userId: string, @Param('workspaceId') workspaceId: string) {
    return this.analyticsService.recentActivity(userId, workspaceId);
  }

  @Get(':workspaceId/usage')
  async getUsageByType(@CurrentUser('id') userId: string, @Param('workspaceId') workspaceId: string) {
    return this.analyticsService.getUsageByType(userId, workspaceId);
  }
}
