import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AskAgentDto {
  @IsString()
  @IsNotEmpty()
  message?: string;
}