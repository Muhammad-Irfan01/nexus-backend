import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { DOCUMENT_JOB, DOCUMENT_QUEUE } from '../constant/document.constants';



@Injectable()
export class DocumentQueueService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue(DOCUMENT_QUEUE, {
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        maxRetriesPerRequest: null,
      },
    });
  }

  async addExtractionJob(
    documentId: string,
  ) {
    await this.queue.add(
      DOCUMENT_JOB,
      {
        documentId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }
}