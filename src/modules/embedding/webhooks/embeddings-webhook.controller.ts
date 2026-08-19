import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmbeddingsProcessor } from '../queues/embeddings.processor';
import { QStashSignatureGuard } from '../../../common/guards/qstash-signature.guard';

@Controller('webhooks/embeddings')
export class EmbeddingsWebhookController {
  constructor(private readonly embeddingsProcessor: EmbeddingsProcessor) {}

  @Post('process')
  @UseGuards(QStashSignatureGuard)
  async processEmbeddings(@Body() body: { documentId: string }) {
    await this.embeddingsProcessor.process(body.documentId);
    return { success: true };
  }
}
