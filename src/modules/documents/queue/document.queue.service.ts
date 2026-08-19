import { Injectable } from '@nestjs/common';
import { QStashService } from '../../../common/qstash/qstash.service';

@Injectable()
export class DocumentQueueService {
  constructor(private readonly qstash: QStashService) {}

  async addExtractionJob(documentId: string) {
    await this.qstash.publish('/webhooks/documents/process', { documentId });
  }
}