import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
  constructor(private readonly prisma: PrismaService) {}

  async getApiKeys(workspaceId: string) {
    return this.prisma.apiKey.findMany({ where: { workspaceId } });
  }

  async createApiKey(workspaceId: string, name: string) {
    const key = `nx_${randomBytes(24).toString('hex')}`;
    return this.prisma.apiKey.create({
      data: { name, key, workspaceId },
    });
  }

  async deleteApiKey(id: string, workspaceId: string) {
    return this.prisma.apiKey.deleteMany({ where: { id, workspaceId } });
  }

  async getAccessProtocols(workspaceId: string) {
    return this.prisma.accessProtocol.findMany({ where: { workspaceId } });
  }

  async createAccessProtocol(workspaceId: string, name: string, configuration: any) {
    return this.prisma.accessProtocol.create({
      data: { name, configuration, workspaceId },
    });
  }

  async deleteAccessProtocol(id: string, workspaceId: string) {
    return this.prisma.accessProtocol.deleteMany({ where: { id, workspaceId } });
  }
}
