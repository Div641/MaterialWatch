import mongoose from "mongoose";
import Chunk from "../models/chunk.model"


export const searchSimilarChunks = async (
    documentId,
    queryEmbedding,
    topK = 5
) => {
        const result = await Chunk.aggregate([
                {
                    $vectorSearch: {
                        index: "embedding_index",
                        //path to field that contains the vectors
                        path: "embedding",
                        queryVector: queryEmbedding,
                        numCandidates: 100,//atlas finds nearest 100 vectors
                        limit: topK,
                        filter: {
                            documentId: new mongoose.Types.ObjectId(documentId)
                        } //to narrow the search area
                    }
                },
                {
                    $project:{
                        text:1,
                        chunkIndex:1,
                        score:{
                            $meta:"vectorSearchScore"
                        }
                    }
                }
        ]);

        return result
    }