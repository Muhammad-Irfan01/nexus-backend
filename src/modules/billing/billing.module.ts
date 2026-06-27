import { Module } from '@nestjs/common';
import { BillingService } from './services/billing.service';
import { BillingController } from './billing.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from './services/stripe.service';

@Module({
  // imports: [StripeService],
  controllers: [BillingController],
  providers: [BillingService, StripeService],
  exports: [BillingService],
})
export class BillingModule {} 
