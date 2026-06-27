import { IsEnum, IsOptional, IsString } from "class-validator";
import { AgentType } from "@prisma/client"

export class CreateAgentDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(AgentType)
    type: AgentType;

    @IsString()
    systemPrompt: string;
}