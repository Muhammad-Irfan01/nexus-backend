import { Injectable } from "@nestjs/common";
import OpenAI from "openai";


@Injectable()
export class EmbeddingService {
    private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    async generateEnbedding(text: string) {
        const res = await this.openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text
        })

        return res.data[0].embedding;
    }
}
