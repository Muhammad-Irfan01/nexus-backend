import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { EMBEDDINGS_QUEUE } from "../constants/embeddings.constants";

@Injectable()
export class EmbeddingQueueService {
    private queue: Queue;

    constructor() {
       this.queue = new Queue(EMBEDDINGS_QUEUE, {
    connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
});
    }

    async addJob(documentId: string) {
        await this.queue.add('generate', { documentId }, {
            attempts: 3, backoff: { type: 'exponential', delay: 5000 }
        });
    }
}