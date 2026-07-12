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

        const workspaceDocuments = await this.Prisma.document.findMany({
            where: { workspaceId },
            select: { id: true }
        });
        const workspaceDocumentIds = workspaceDocuments.map(doc => doc.id);

        // Filter by workspace at the Qdrant query level instead of fetching
        // 20 global matches and hoping enough of them belong to this workspace.
        const match = await this.retrival.retrive(question, 20, workspaceDocumentIds);

        const filteredMatch = (match as any[]).filter(
            (item: any) => workspaceDocumentIds.includes(item.payload.documentId),
        );

        if (filteredMatch.length === 0) {
            await this.usageTracker.track(userId, workspaceId, 'RAG_QUERY', { question });
            return {
                answer: 'I could not find that information in the uploaded documents.',
                source: [],
            };
        }

        const context = filteredMatch.map((item: any) => item.payload.content).join('\n\n');
        const prompt = this.promprbuilder.builderPrompt(question, context);

        let response;
        try {
            response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    }
                ]
            });
        } catch (error) {
            console.error('RagService.ask: OpenAI completion failed', error);
            throw error;
        }

        await this.Prisma.retrievalLog.create({
            data: { workspaceId, query: question, retrievedChunks: filteredMatch as any }
        });

        await this.usageTracker.track(userId, workspaceId, 'RAG_QUERY', { question });

        return {
            answer: response.choices[0].message.content || '',
            source: filteredMatch.map((item: any) => ({ chunkId: item.payload.chunkId, documentId: item.payload.documentId })),
        }
    }
}