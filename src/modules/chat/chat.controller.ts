import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './services/chat.service';
import { ConversationService } from './services/conversation.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';


@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly conversationService:
      ConversationService,
  ) {}

  @Post('workspace/:workspaceId/conversations')
  createConversation(
    @CurrentUser('id')
    userId: string,

    @Param('workspaceId')
    workspaceId: string,

    @Body()
    dto: CreateConversationDto,
  ) {
    return this.conversationService
      .createConversation(
        userId,
        workspaceId,
        dto.title || '',
      );
  }

  @Get('workspace/:workspaceId/conversations')
  getConversations(
    @CurrentUser('id')
    userId: string,

    @Param('workspaceId')
    workspaceId: string,
  ) {
    return this.conversationService
      .getWorkspaceConversation(
        userId,
        workspaceId,
      );
  }

  @Get('conversations/:conversationId')
  getConversation(
    @CurrentUser('id')
    userId: string,

    @Param('conversationId')
    conversationId: string,
  ) {
    return this.conversationService
      .getConversation(
        userId,
        conversationId,
      );
  }

  @Delete('conversations/:conversationId')
  deleteConversation(
    @CurrentUser('id')
    userId: string,

    @Param('conversationId')
    conversationId: string,
  ) {
    return this.conversationService
      .deleteConversation(
        userId,
        conversationId,
      );
  }

  @Post('conversations/:conversationId/messages')
  sendMessage(
    @CurrentUser('id')
    userId: string,

    @Param('conversationId')
    conversationId: string,

    @Body()
    dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      userId,
      conversationId,
      dto.message,
    );
  }
}