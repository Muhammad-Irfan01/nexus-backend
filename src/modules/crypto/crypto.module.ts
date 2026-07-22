import { Module } from '@nestjs/common';
import { CryptoService } from './services/crypto.service';
import { CryptoController } from './crypto.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CryptoController],
  providers: [CryptoService, PrismaService],
  exports: [CryptoService],
})
export class CryptoModule {}
