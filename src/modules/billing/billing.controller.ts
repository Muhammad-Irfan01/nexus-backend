import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BillingService } from './services/billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {

  }

  @Post(':workspaceId/checkout')
  checkout( @CurrentUser('sub') userId: string, @Param('workspaceId') workspaceId: string, @Body() dto: { priceId: string }) {
    return this.billingService.createCheckoutSession(userId, workspaceId, dto.priceId);
  }

  @Get(':workspaceId/portal')
  portal(@Param('workspaceId') workspaceId: string) {
    return this.billingService.createPortalSession(workspaceId);
  }

  @Get(':workspaceId/subscription')
  subscription(@Param('workspaceId') workspaceId: string) {
    return this.billingService.getSubscription(workspaceId);
  }
}
