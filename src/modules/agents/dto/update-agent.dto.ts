import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { AgentType } from "@prisma/client"

export class UpdateAgentDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(AgentType)
    @IsOptional()
    type: AgentType;

    @IsString()
    @IsOptional()
    systemPrompt?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}