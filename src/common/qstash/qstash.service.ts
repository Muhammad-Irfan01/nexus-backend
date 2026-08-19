import { Injectable } from '@nestjs/common';
import { Client } from '@upstash/qstash';

@Injectable()
export class QStashService {
  private client: Client;

  constructor() {
    this.client = new Client({ token: process.env.QSTASH_TOKEN! });
  }

  async publish(path: string, body: any) {
    await this.client.publishJSON({
      url: `${process.env.BACKEND_URL}${path}`,
      body,
    });
  }
}
