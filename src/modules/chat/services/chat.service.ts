import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RagService } from '../../rag/services/rag.service';
import { UsageTrackerService } from '../../analytics/services/usage-tracker.service';

@Injectable()
export class ChatService {
    constructor( private readonly prisma: PrismaService, private ragservice: RagService, private readonly usageTracker: UsageTrackerService) {}

    async sendMessage(userID: string, conversationId: string, message: string) {
        const conversation = await this.prisma.conversation.findUnique({
            where: {id: conversationId}
        })

        if(!conversation) throw new ForbiddenException('Conversation not found');

        await this.prisma.message.create({
            data: {conversationId, role: 'USER', content: message}
            
        })

        const response = await this.ragservice.ask(userID, message, conversation.workspaceId);

        await this.prisma.message.create({
            data: {conversationId, role: 'ASSISTANT', content: response.answer}
        })

        await this.prisma.conversation.update({
            where: {id: conversationId},
            data: {updatedAt: new Date()},
        })
        
        await this.usageTracker.track(userID, conversation.workspaceId, 'CHAT_MESSAGE', {conversationId, message});

        return response
    }
}
