import { IsUUID } from "class-validator";


export class uploadDocumentDto {
     @IsUUID()
     workspaceId: string
}