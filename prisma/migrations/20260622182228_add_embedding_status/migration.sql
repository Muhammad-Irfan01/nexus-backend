-- AlterTable
ALTER TABLE "DocumentChunk" ADD COLUMN     "embeddingStatus" "EmbeddingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "qdrantPointId" TEXT;
