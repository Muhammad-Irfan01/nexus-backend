import {
  Controller,
  Post,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EmbeddingQueueService } from './queues/embeddings.queue.service';



@UseGuards(JwtAuthGuard)
@Controller('embeddings')
export class EmbeddingsController {
  constructor(
    private readonly embeddingsQueue: EmbeddingQueueService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 🚀 Manually trigger embeddings for a document
   * (Useful for retry / debugging / admin panel)
   */
  @Post('document/:documentId/generate')
  async generateEmbeddings(
    @CurrentUser('id') userId: string,
    @Param('documentId') documentId: string,
  ) {
    // Validate document ownership via workspace
    const document =
      await this.prisma.document.findUnique({
        where: { id: documentId },
      });

    if (!document) {
      throw new Error('Document not found');
    }

    const membership =
      await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: document.workspaceId,
          },
        },
      });

    if (!membership) {
      throw new Error(
        'You are not a member of this workspace',
      );
    }

    await this.embeddingsQueue.addJob(documentId);

    return {
      message: 'Embedding job queued successfully',
      documentId,
    };
  }

  /**
   * 📊 Get embedding status for a document
   */
  @Get('document/:documentId/status')
  async getEmbeddingStatus(
    @CurrentUser('id') userId: string,
    @Param('documentId') documentId: string,
  ) {
    const document =
      await this.prisma.document.findUnique({
        where: { id: documentId },
        include: {
          chunks: true,
        },
      });

    if (!document) {
      throw new Error('Document not found');
    }

    const membership =
      await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: document.workspaceId,
          },
        },
      });

    if (!membership) {
      throw new Error(
        'You are not a member of this workspace',
      );
    }

    const total = document.chunks.length;

    const completed = document.chunks.filter(
      (c: any) => c.embeddingStatus === 'COMPLETED',
    ).length;

    const failed = document.chunks.filter(
      (c: any) => c.embeddingStatus === 'FAILED',
    ).length;

    const processing = document.chunks.filter(
      (c: any) => c.embeddingStatus === 'PROCESSING',
    ).length;

    const pending = document.chunks.filter(
      (c: any) => c.embeddingStatus === 'PENDING',
    ).length;

    return {
      documentId,
      stats: {
        total,
        completed,
        failed,
        processing,
        pending,
      },
      progress:
        total === 0
          ? 0
          : Math.round(
              (completed / total) * 100,
            ),
    };
  }

  /**
   * 🔁 Retry failed embeddings
   */
  @Post('document/:documentId/retry')
  async retryEmbeddings(
    @CurrentUser('id') userId: string,
    @Param('documentId') documentId: string,
  ) {
    const document =
      await this.prisma.document.findUnique({
        where: { id: documentId },
      });

    if (!document) {
      throw new Error('Document not found');
    }

    const membership =
      await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: document.workspaceId,
          },
        },
      });

    if (!membership) {
      throw new Error(
        'You are not a member of this workspace',
      );
    }

    // Reset failed chunks
    await this.prisma.documentChunk.updateMany({
      where: {
        documentId,
        embeddingStatus: 'FAILED',
      },
      data: {
        embeddingStatus: 'PENDING',
      },
    });

    await this.embeddingsQueue.addJob(documentId);

    return {
      message: 'Retry initiated for embeddings',
      documentId,
    };
  }
}