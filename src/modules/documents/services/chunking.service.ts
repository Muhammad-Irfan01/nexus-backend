import { Injectable } from "@nestjs/common";


@Injectable()
export class ChunkingService {
    private readonly CHUNK_SIZE = 1000;
  private readonly CHUNK_OVERLAP = 200;

   splitText(text: string): string[] {
    const chunks: string[] = [];

    let start = 0;

    while (start < text.length) {
      const end = start + this.CHUNK_SIZE;

      chunks.push(
        text.slice(start, end).trim(),
      );

      start += this.CHUNK_SIZE - this.CHUNK_OVERLAP;
    }

    return chunks.filter(Boolean);
  }

  estimateTokens(text: string): number {
    return Math.ceil(
      text.split(/\s+/).length * 1.3,
    );
  }
}