/// <reference types="multer" />
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Express } from 'express';
import { DocumentQueueService } from '../queue/document.queue.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { DocumentStatus } from '@prisma/client';
import * as fs from 'fs/promises';

@Injectable()
export class DocumentsService {
    constructor( private readonly prisma: PrismaService, private documentQueueService: DocumentQueueService ) {}


    async uploadDocument(userId: string, workspaceId: string, file: Express.Multer.File) {
        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId : {userId, workspaceId}}
        })

        if(!membership) throw new ForbiddenException('You are not a member of this workspace');

        const document = await this.prisma.document.create({
            data: {
                workspaceId,
                uploadedById: userId,
                name: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                storagePath: file.path,
                status: DocumentStatus.PROCESSING,
            }
        })

        await this.documentQueueService.addExtractionJob(document.id);

        return document
    }

    async getWorkspaceDocument( userId: string, workspaceId: string) {
        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId}}
        })

        if(!membership) throw new ForbiddenException('You are not a member of this workspace');

        return this.prisma.document.findMany({
            where: {workspaceId}, include: {uploadedBy : {select: {id: true, email: true, firstName: true, lastName: true, avatar: true}} }
        })
    }

    async getDocumentById(userId: string, documentId: string) {
        const document = await this.prisma.document.findUnique({
            where: {id: documentId}, include: {uploadedBy : {select: {id: true, email: true, firstName: true, lastName: true, avatar: true}},
            chunks: {orderBy: {createdAt: 'asc'}} }
        })

        if(!document) throw new ForbiddenException('Document not found');

        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId: document.workspaceId}}
        })

        if(!membership) throw new ForbiddenException('You are not a member of this workspace');

        return document;
    }

    async deleteDocument(userId: string, documentId: string) {
        const document = await this.prisma.document.findUnique({
            where: {id: documentId}
        })

        if(!document) throw new ForbiddenException('Document not found');

        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId: document.workspaceId}}
        })

        if(!membership) throw new ForbiddenException('You are not a member of this workspace');

        try {
            await fs.unlink(document.storagePath);
        } catch (error: any) {
            console.log('File already deletde', error.message)
        }

        await this.prisma.document.delete({
            where: {id: documentId}
        })

        return {message: 'Document deleted successfully'}
    }

    async retryProcessing(userId: string, documentId: string) {
        const document = await this.prisma.document.findUnique({
            where: {id: documentId}
        })

        if(!document) throw new ForbiddenException('Document not found');

        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId: document.workspaceId}}
        })

        if(!membership) throw new ForbiddenException('You are not a member of this workspace');

        await this.prisma.document.update({
            where: {id: documentId}, data: {status: DocumentStatus.PROCESSING}
        })

        await this.documentQueueService.addExtractionJob(document.id);

        return {message: 'Document reprocessing started'}
    }


  async getDocumentChunks(userId: string, documentId: string) {
    const document = await this.getDocumentById(userId, documentId);

    return this.prisma.documentChunk.findMany({
      where: { documentId: document.id },
      orderBy: { chunkIndex: 'asc' },
    });
  }

  async getDocumentStats (userId: string, documentId: string) {
    const document = await this.getDocumentById(userId, documentId);

    const chunkCount = await this.prisma.documentChunk.count({
      where: { documentId: document.id },
    });

    const tokenSum = await this.prisma.documentChunk.aggregate({
      where: { documentId: document.id },
      _sum: { tokenCount: true },
    });

    return {
        documentId: document.id,
      chunkCount,
      tokenSum: tokenSum._sum.tokenCount,
      status: document.status,
      processedAt: document.processedAt
      
    };
  }
}
