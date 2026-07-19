import Chunk from "../models/chunk.model.js";
import { generateEmbedding } from "./embedding.service.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";

//to retrieve relevant chunks from top vector search chunks
export const retrieveRelevantChunks = async ({
    documentId,
    query,
    topK = 10
}) => {

    const queryEmbedding = await generateEmbedding(query); //for user query

    const chunks = await Chunk.find({ //loading all related chunks only
        documentId
    }).lean();

    if (!chunks.length) {
        return [];
    }

    //calculate similarity score using cosine
    const scoredChunks = chunks
        .filter(chunk => Array.isArray(chunk.embedding) && chunk.embedding.length)
        .map(chunk => ({

            text: chunk.text,

            metadata: chunk.metadata,

            chunkIndex: chunk.chunkIndex,

            score: cosineSimilarity(
                queryEmbedding,
                chunk.embedding
            )

        }));

    //sorting score wise
    scoredChunks.sort((a, b) => b.score - a.score);
    //returning top k(here 10) chunks relevant 
    return scoredChunks.slice(0, topK);

};