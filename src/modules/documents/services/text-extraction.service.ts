import { Injectable } from "@nestjs/common";
import * as mammoth from 'mammoth';
import pdf from 'pdf-parse';
import { SupabaseStorageService } from './supabase-storage.service';


@Injectable()
export class TextExtractionService {
    constructor(private readonly supabaseStorage: SupabaseStorageService) { }

    async extractText(filePath: string, mimeType: string): Promise<string> {
        switch (mimeType) {
            case 'application/pdf':
                return this.extractPdf(filePath);

            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return this.extractDocx(filePath);

            case 'text/plain':
                return this.extractTxt(filePath);

            default:
                throw new Error(
                    `Unsupported file type ${mimeType}`,
                );
        }
    }

    private async extractPdf(
        filePath: string,
    ): Promise<string> {
        const buffer = await this.supabaseStorage.download(filePath);

        const data = await pdf(buffer);

        return data.text;
    }

    private async extractDocx(
        filePath: string,
    ): Promise<string> {
        const buffer = await this.supabaseStorage.download(filePath);
        const result =
            await mammoth.extractRawText({
                buffer: buffer,
            });

        return result.value;
    }

    private async extractTxt(
        filePath: string,
    ): Promise<string> {
        const buffer = await this.supabaseStorage.download(filePath);
        return buffer.toString('utf8');
    }
}
