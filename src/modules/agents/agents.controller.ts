import { Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { agentService } from './services/agent.service';
import { AgentExecutorService } from './services/agent-executor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
    constructor( private readonly agentservice: agentService, private readonly agentexecution: AgentExecutorService) {}

    @Post('workspace/:workspaceId')
    async createAgent( @CurrentUser('id') userId: string, @Param('workspaceId') workspaceId: string, dto: CreateAgentDto) {
        return this.agentservice.createAgent(workspaceId, userId, dto);
    }

    @Get('workspace/:workspaceId')
    async getAgents( @CurrentUser('id') userId: string, @Param('workspaceId') workspaceId: string) {
        return this.agentservice.getAgents(userId, workspaceId);
    }

    @Get(':agentId')
    async getAgent( @CurrentUser('id') userId: string, @Param('agentId') agentId: string) {
        return this.agentservice.getAgent(userId, agentId);
    }

    @Patch(':agentId')
    async updateAgent( @CurrentUser('id') userId: string, @Param('agentId') agentId: string, dto: CreateAgentDto) {
        return this.agentservice.updateAgent(userId, agentId, dto);
    }

    @Delete(':agentId')
    async deleteAgent( @CurrentUser('id') userId: string, @Param('agentId') agentId: string) {
        return this.agentservice.deleteAgent(userId, agentId);
    }

    @Post(':agentId/execute')
    async executeAgent( @CurrentUser('id') userId: string, @Param('agentId') agentId: string, message: string) {
        return this.agentexecution.executeAgent(agentId, userId, message);
    }
}
