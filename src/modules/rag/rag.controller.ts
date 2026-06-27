import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { RagService } from './services/rag.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('rag')
@UseGuards(JwtAuthGuard)
export class RagController {
    constructor(private readonly regservice: RagService, private readonly prisma: PrismaService) {}

    @Post(':workspaceId/ask')
    async askQuestion( @Param('workspaceId') workspaceId: string, @Body() dto: AskQuestionDto, @CurrentUser() user: any) {
        return this.regservice.ask(user.id, dto.question, workspaceId);
    }
}
