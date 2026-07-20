//used to embed text using gemini embedding model
import ai from "../config/config.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateEmbedding = async (text) => {
    if (!text || typeof text !== "string") {
        throw new Error("Invalid text provided for embedding.");
    }

    for (let attempt = 1; attempt <= retries; attempt++){
        try {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: text,
        });

        const embedding = response.embeddings?.[0]?.values;
        if (!embedding) {
            throw new Error("No embedding returned from Gemini.");
        }

        if(!Array.isArray(embedding)|| embedding.length===0){
            throw new Error("Invalid embedding generated.");
        }
        
        // console.log("Embedding dimension:", embedding.length);
        return embedding;

    } catch (error) {
         const isRateLimit =
                error.status === 429 ||
                error.message?.includes("429") ||
                error.message?.includes("Quota");
            if (isRateLimit && attempt < retries) {
                console.warn(
                    `[Embedding Rate Limit] Hit quota limit. Retrying attempt ${attempt}/${retries} in ${delay}ms...`
                );
                await sleep(delay);
                delay *= 2; // Exponential backoff (2s -> 4s -> 8s -> 16s)
            } else {
                console.error("Embedding generation failed:", error.message);
                throw error;
            }
        }
    }
};