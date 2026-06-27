import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) {}

    async validateMembership(userId: string, workspaceId: string) {
        const membership = await this.prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId,
                    workspaceId,
                },
            },
        });

        if (!membership) {
            throw new Error('You are not a member of this workspace');
        }
        }

    async getOverview(userId: string, workspaceId: string) {
        await this.validateMembership(userId, workspaceId);

        const [documents, conversationId, message, agent, usageEvents] = await Promise.all([
            this.prisma.document.count({ where: { workspaceId } }),
            this.prisma.conversation.count({ where: { workspaceId } }),
            this.prisma.message.count({ where: { conversation: { workspaceId } } }),
            this.prisma.agent.count({ where: { workspaceId } }),
            this.prisma.usageEvent.count({ where: { workspaceId } }),
        ]);

        return {
            documents,
            conversationId,
            message,
            agent,
            usageEvents,
        };
    }

    async getUsageByType(userId: string, workspaceId: string) {
        await this.validateMembership(userId, workspaceId);

        return this.prisma.usageEvent.groupBy({
            by: ['eventType'],
            _count: {
                eventType: true,
            },
        });
    }

    async recentActivity (userId: string, workspaceId: string) {
        await this.validateMembership(userId, workspaceId);

        return this.prisma.usageEvent.findMany({
            where: {workspaceId},
            orderBy: {createdAt: 'desc'},
            take: 50,
        })
    }
}
