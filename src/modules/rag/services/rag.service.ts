import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../../../prisma/prisma.service';
import { RetrivalService } from './retrieval.service';
import { PromptBuilderService } from './prompt-builder.service';
import { UsageTrackerService } from '../../analytics/services/usage-tracker.service';

@Injectable()
export class RagService {
    private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    constructor( private Prisma: PrismaService, private retrival: RetrivalService, private promprbuilder: PromptBuilderService, private readonly usageTracker: UsageTrackerService) {}

    async ask(userId: string, question: string, workspaceId: string) {
        const match =  await this.retrival.retrive(question);

        const context = match.map((item: any) => item.payload.content).join('\n\n');

        const prompt = this.promprbuilder.builderPrompt(question, context);

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                }
            ]
        })

        await this.Prisma.retrievalLog.create({
            data: {workspaceId, query: question, retrievedChunks: match as any}
        });

        await this.usageTracker.track(userId, workspaceId, 'RAG_QUERY', {question});

        return {
            answer: response.choices[0].message.content || '',
                source: match.map((item: any) => ({chunkId: item.payload.content, documentId: item.payload.documentId}))
            
        }
    }
}
