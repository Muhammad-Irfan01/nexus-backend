import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ConversationService } from './services/conversation.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [PrismaModule, RagModule],
  providers: [ChatService, ConversationService],
  controllers: [ChatController]
})
export class ChatModule {}
