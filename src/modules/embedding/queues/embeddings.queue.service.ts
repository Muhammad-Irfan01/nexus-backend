import { Injectable } from "@nestjs/common";
import { QStashService } from "../../../common/qstash/qstash.service";

@Injectable()
export class EmbeddingQueueService {
    constructor(private readonly qstash: QStashService) {}

    async addJob(documentId: string) {
        await this.qstash.publish('/webhooks/embeddings/process', { documentId });
    }
}