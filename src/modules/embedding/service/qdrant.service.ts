import { Injectable } from "@nestjs/common";
import { QdrantClient } from "@qdrant/js-client-rest";


@Injectable()
export class QdrantService {
    private client = new QdrantClient({
        apiKey: process.env.QDRANT_API_KEY,
        url: process.env.QDRANT_URL
    })

    COLLECTION = 'nexus-chunks';

    async createCollection() {
        const collection = await this.client.getCollections();

        const exist = collection.collections.find((c) => c.name === this.COLLECTION);

        if (!exist) {
            await this.client.createCollection(this.COLLECTION, { vectors: { size: 1536, distance: 'Cosine' } });
        }
    }

    async upsertVector(id: string, vector: number[], payload: Record<string, any>) {

        return this.client.upsert(this.COLLECTION, { wait: true, points: [{ id, vector, payload }] })
    }

    async search(vector: number[], limit = 5) {
        return this.client.search(this.COLLECTION, { vector, limit });
    }

    async deleteByDocument(documentId: string) {
        return this.client.delete(this.COLLECTION, { filter: { must: [{ key: documentId, match: { value: documentId } }] } })
    }
}