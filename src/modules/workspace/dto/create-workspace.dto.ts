import { IsString, MinLength } from "class-validator";


export class CreateWorkspaceDto {

    @IsString()
    @MinLength(3)
    name: string;

    @IsString()
    slug: string;

    @IsString()
    description: string;
}