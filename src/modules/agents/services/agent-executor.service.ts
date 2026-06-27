import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { RetrivalService } from "../../rag/services/retrieval.service";
import OpenAI from "openai";
import { UsageTrackerService } from "../../analytics/services/usage-tracker.service";


@Injectable()
export class AgentExecutorService {
    private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    constructor( private readonly prisma: PrismaService, private readonly retrivalservice: RetrivalService, private readonly usageTracker: UsageTrackerService) {}

    async executeAgent(agentId: string, userId: string, message: string) {
        const agent = await this.prisma.agent.findUnique({
            where: {id: agentId}
        })

        if(!agent) throw new ForbiddenException('Agent not found');

        const membership = await this.prisma.workspaceMember.findUnique({
            where: {userId_workspaceId: {userId, workspaceId: agent.workspaceId}}
        })

        if(!membership) throw new ForbiddenException('You are not a member of this workspace');

        const content = await this.retrivalservice.retrive(message, 5);

        const context = content.map((item: any) => item.payload.content).join('\n\n');

        const prompt =  `${agent.systemPrompt}

        use the following context to answer

        context: ${context}
        question: ${message} `

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
                {
                    role: 'system',
                    content: agent.systemPrompt
                }
            ]
        })

        await this.usageTracker.track(userId, agent.workspaceId, 'AGENT_MESSAGE', {agentId, message});

        return {
            answer: completion.choices[0].message.content || '',
            sources: content.map((item: any) => ({
                documentId: item.payload.documentId,
                chunkId: item.payload.chunkId,
            }))
        }
    }
}