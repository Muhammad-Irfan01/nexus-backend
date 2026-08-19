import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DocumentProcessor } from '../queue/document.processor';
import { QStashSignatureGuard } from '../../../common/guards/qstash-signature.guard';

@Controller('webhooks/documents')
export class DocumentWebhookController {
  constructor(private readonly documentProcessor: DocumentProcessor) {}

  @Post('process')
  @UseGuards(QStashSignatureGuard)
  async processDocument(@Body() body: { documentId: string }) {
    await this.documentProcessor.process(body.documentId);
    return { success: true };
  }
}
