//used to embed text using gemini embedding model
import ai from "../config/config.js";

export const generateEmbedding = async (text) => {
    if (!text || typeof text !== "string") {
        throw new Error("Invalid text provided for embedding.");
    }

    try {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: text,
        });

        const embedding = response.embeddings?.[0]?.values;
        if (!embedding) {
            throw new Error("No embedding returned from Gemini.");
        }

        return embedding;

    } catch (error) {
        console.error("Embedding generation failed:", error.message);
        throw error;
    }
};