import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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
    async createAgent( @CurrentUser('sub') userId: string, @Param('workspaceId') workspaceId: string, @Body() dto: CreateAgentDto) {
        return this.agentservice.createAgent(workspaceId, userId, dto);
    }

    @Get('workspace/:workspaceId')
    async getAgents( @CurrentUser('sub') userId: string, @Param('workspaceId') workspaceId: string) {
        return this.agentservice.getAgents(workspaceId, userId);
    }

    @Get(':agentId')
    async getAgent( @CurrentUser('sub') userId: string, @Param('agentId') agentId: string) {
        return this.agentservice.getAgent(agentId, userId);
    }

    @Patch(':agentId')
    async updateAgent( @CurrentUser('sub') userId: string, @Param('agentId') agentId: string, @Body() dto: CreateAgentDto) {
        return this.agentservice.updateAgent(agentId, userId, dto);
    }

    @Delete(':agentId')
    async deleteAgent( @CurrentUser('sub') userId: string, @Param('agentId') agentId: string) {
        return this.agentservice.deleteAgent(agentId, userId);
    }

    @Post(':agentId/execute')
    async executeAgent( @CurrentUser('sub') userId: string, @Param('agentId') agentId: string, @Body() message: { message: string }) {
        return this.agentexecution.executeAgent(agentId, userId, message.message);
    }
}
