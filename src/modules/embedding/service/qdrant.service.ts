import { Injectable } from "@nestjs/common";
import { QdrantClient } from "@qdrant/js-client-rest";


@Injectable()
export class QdrantService {
    private client = new QdrantClient({
        apiKey: process.env.QDRANT_API_KEY,
        url: process.env.QDRANT_URL
    })

    COLLECTION = 'nexus-chunks';

    async ensureCollection() {
        try {
            const collections = await this.client.getCollections();
            const exists = collections.collections.find((c) => c.name === this.COLLECTION);

            if (!exists) {
                await this.client.createCollection(this.COLLECTION, { vectors: { size: 1536, distance: 'Cosine' } });
            }
        } catch (error) {
            console.error('Failed to ensure Qdrant collection:', error);
            throw error;
        }
    }

    async upsertVector(id: string, vector: number[], payload: Record<string, any>) {
        await this.ensureCollection();
        return this.client.upsert(this.COLLECTION, { wait: true, points: [{ id, vector, payload }] })
    }

    async search(vector: number[], limit = 5) {
        await this.ensureCollection();
        return this.client.search(this.COLLECTION, { vector, limit });
    }

    async deleteByDocument(documentId: string) {
        await this.ensureCollection();
        return this.client.delete(this.COLLECTION, { filter: { must: [{ key: 'documentId', match: { value: documentId } }] } })
    }
}