import { Injectable } from "@nestjs/common";
import * as fs from 'fs/promises';
// import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import pdf from 'pdf-parse';


@Injectable()
export class TextExtractionService {
    constructor() { }

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
        const buffer = await fs.readFile(filePath);

        const data = await pdf(buffer);

        return data.text;
    }

    private async extractDocx(
        filePath: string,
    ): Promise<string> {
        const result =
            await mammoth.extractRawText({
                path: filePath,
            });

        return result.value;
    }

    private async extractTxt(
        filePath: string,
    ): Promise<string> {
        return fs.readFile(filePath, 'utf8');
    }
}
