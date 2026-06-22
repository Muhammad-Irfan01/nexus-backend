import { Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DocumentsService } from './services/documents.service';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
    constructor(private readonly documentservice: DocumentsService) { }

    @Post('workspace/:workspaceId/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads', filename: (req, file, callback) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
                callback(null, unique + extname(file.originalname));
            },
        }),
        fileFilter: (req, file, callback) => {
            const allowedMimeTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
            ];

            if (
                !allowedMimeTypes.includes(file.mimetype)
            ) {
                return callback(
                    new Error(
                        'Only PDF, DOCX and TXT files are allowed',
                    ),
                    false,
                );
            }

            callback(null, true);
        },

        limits: {
            fileSize: 20 * 1024 * 1024, // 20 MB
        },
    }))
     async uploadDocument(
    @CurrentUser('id') userId: string,

    @Param('workspaceId')
    workspaceId: string,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.documentservice.uploadDocument(
      userId,
      workspaceId,
      file,
    );
  }

  @Get('workspace/:workspaceId')
  async getWorkspaceDocument (@CurrentUser('id') userId: string, @Param('workspaceId') workspaceId: string) {
    return this.documentservice.getWorkspaceDocument(userId, workspaceId);
  }

  @Get(':documentId')
  async getDocumentId( @CurrentUser('id') userId: string, @Param('documentId') documentId: string) {
    return this.documentservice.getDocumentById(userId, documentId);
  }

  @Delete(':documentId')
  async deleteDocument( @CurrentUser('id') userId: string, @Param('documentId') documentId: string) {
    return this.documentservice.deleteDocument(userId, documentId);
  }

  @Post(':documentId/retry')
  async retryProcessing( @CurrentUser('id') userId: string, @Param('documentId') documentId: string) {
    return this.documentservice.retryProcessing(userId, documentId);
  }

  @Get(':documentId/chunks')
  async getDocumentChunks( @CurrentUser('id') userId: string, @Param('documentId') documentId: string) {
    return this.documentservice.getDocumentChunks(userId, documentId);
  }

  @Get(':documentId/stats')
  async getDocumentStats( @CurrentUser('id') userId: string, @Param('documentId') documentId: string) {
    return this.documentservice.getDocumentStats(userId, documentId);
  }
}
