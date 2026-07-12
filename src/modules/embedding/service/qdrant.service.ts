import { Injectable } from "@nestjs/common";
import { QdrantClient } from "@qdrant/js-client-rest";


@Injectable()
    export class QdrantService {
        private client = new QdrantClient({
            apiKey: process.env.QDRANT_API_KEY,
            url: process.env.QDRANT_URL
        })

        COLLECTION = 'nexus-chunks';
        private collectionReady = false;

        async ensureCollection() {
            if (this.collectionReady) return;

            try {
                const collections = await this.client.getCollections();
                const exists = collections.collections.find((c) => c.name === this.COLLECTION);

                if (!exists) {
                    await this.client.createCollection(this.COLLECTION, { vectors: { size: 1536, distance: 'Cosine' } });
                }

                // Qdrant Cloud requires a payload index before you can filter on a
                // field (e.g. our workspace-scoped documentId filter in search()).
                // Creating an index that already exists is a no-op, so this is safe.
                await this.client.createPayloadIndex(this.COLLECTION, {
                    field_name: 'documentId',
                    field_schema: 'keyword',
                });

                this.collectionReady = true;
            } catch (error) {
                console.error('Failed to ensure Qdrant collection:', error);
                throw error;
            }
        }

        async upsertVector(id: string, vector: number[], payload: Record<string, any>) {
            await this.ensureCollection();
            return this.client.upsert(this.COLLECTION, { wait: true, points: [{ id, vector, payload }] })
        }

        async search(vector: number[], limit = 5, documentIds?: string[]) {
            await this.ensureCollection();
            return this.client.search(this.COLLECTION, {
                vector,
                limit,
                with_payload: true,
                ...(documentIds && documentIds.length > 0
                    ? { filter: { must: [{ key: 'documentId', match: { any: documentIds } }] } }
                    : {}),
            });
        }

        async deleteByDocument(documentId: string) {
            await this.ensureCollection();
            return this.client.delete(this.COLLECTION, { filter: { must: [{ key: 'documentId', match: { value: documentId } }] } })
        }
    }