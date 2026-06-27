import { Module } from '@nestjs/common';
import { BillingService } from './services/billing.service';
import { BillingController } from './billing.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [PrismaService],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
