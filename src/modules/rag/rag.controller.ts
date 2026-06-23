import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { RagService } from './services/rag.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@Controller('rag')
@UseGuards(JwtAuthGuard)
export class RagController {
    constructor(private readonly regservice: RagService, private readonly prisma: PrismaService) {}

    @Post(':workspaceId/ask')
    async askQuestion( @Param('workspaceId') workspaceId: string, @Body() dto: AskQuestionDto) {
        return this.regservice.ask(dto.question, workspaceId);
    }
}
