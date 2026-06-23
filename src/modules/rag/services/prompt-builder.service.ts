import { Injectable } from "@nestjs/common";


@Injectable()
export class PromptBuilderService {
    builderPrompt (question: string, context: string) {
        return `you are an AI assistant
        Answer only using provided context. If the answer is not found in the context. respond: "I could not find that information in the uploaded documents."
            context: ${context}
            question: ${question}
            Answer: 
        `
    }
}