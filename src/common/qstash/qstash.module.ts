import { Module } from '@nestjs/common';
import { QStashService } from './qstash.service';

@Module({
  providers: [QStashService],
  exports: [QStashService],
})
export class QStashModule {}
