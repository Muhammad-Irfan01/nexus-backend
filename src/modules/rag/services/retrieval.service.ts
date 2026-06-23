import { Injectable } from "@nestjs/common";
import { EmbeddingService } from "../../embedding/service/embedding.service";
import { QdrantService } from "../../embedding/service/qdrant.service";


@Injectable()
export class RetrivalService {
    constructor( private embedding: EmbeddingService, private qdrant: QdrantService) {}

    async retrive( question: string, limit = 5) {
        const vector = await this.embedding.generateEnbedding(question);

        const res = await this.qdrant.search(vector, limit);

        return res;
    }
}