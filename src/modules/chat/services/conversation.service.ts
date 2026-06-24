import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";


@Injectable()
export class ConversationService {
    constructor( private readonly prisma: PrismaService) {}

    async createConversation (userId: string, workspaceId: string, title: string) {
        const member = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId}}
        })

        if(!member) throw new ForbiddenException('You are not a member of this workspace');

        const conversation  =  await this.prisma.conversation.create({
            data: {title, workspaceId, createdById: userId}
        })

        return conversation;
    }

    async getWorkspaceConversation(userId: string, workspaceId: string) {
        const member = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId}}
        })

        if(!member) throw new ForbiddenException('You are not a member of this workspace');

        return this.prisma.conversation.findMany({
            where: {workspaceId},
            orderBy: {updatedAt: 'desc'}
        })
    }

    async getConversation(userId: string, conversationId: string) {
        const conversation = await this.prisma.conversation.findUnique({
            where: {id: conversationId}
        });
        
        if (!conversation) throw new ForbiddenException('Conversation not found');

        const member = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId: conversation.workspaceId}}
        })

        if(!member) throw new ForbiddenException('You are not a member of this workspace');

        return this.prisma.conversation.findUnique({
            where: {id: conversationId},
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        })
    }

    async deleteConversation(userId: string, conversationId: string) {
        return this.prisma.conversation.delete({
            where: {id: conversationId}
        })
    }
}