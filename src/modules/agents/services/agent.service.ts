import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAgentDto } from '../dto/create-agent.dto';
import { UpdateAgentDto } from '../dto/update-agent.dto';

@Injectable()
export class agentService {
    constructor( private readonly prisma: PrismaService) { }

    async createAgent(workspaceId: string, userId: string, dto: CreateAgentDto) {
        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId}}
        })

        if(!membership) throw new ForbiddenException('You are not a member of this workspace');

        return this.prisma.agent.create({
            data: {
                workspaceId,
                name: dto.name,
                type: dto.type,
                description: dto.description,
                systemPrompt: dto.systemPrompt
            }
        })
    }

    async getAgents(userId: string, workspaceId: string) {
        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId}}
        })

        if(!membership) throw new ForbiddenException('You are not a member of this workspace');

        return this.prisma.agent.findMany({
            where: {workspaceId},
            orderBy: {createdAt: 'desc'}
        })
    }

    async getAgent(userId: string, agentId: string) {
        const agent = await this.prisma.agent.findUnique({
            where: {id: agentId}
        })

        if(!agent) throw new ForbiddenException('Agent not found');

        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId: agent.workspaceId}}
        })

        if(!membership) throw new ForbiddenException('You are not a member of this workspace');

        return agent;
    }

    async updateAgent(userId: string, agentId: string, dto: UpdateAgentDto) {
        const agent = await this.getAgent(userId, agentId);

        return this.prisma.agent.update({
            where: {id: agentId}, data: dto
        })
    }

    async deleteAgent(userId: string, agentId: string) {
        const agent = await this.getAgent(userId, agentId);

        return this.prisma.agent.delete({
            where: {id: agentId}
        })
    }
}
