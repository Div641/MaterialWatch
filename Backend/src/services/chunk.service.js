import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const chunkText = async (text) => {
    if (!text || typeof text !== "string") {
        throw new Error("Invalid text");
    }

    const cleanedText = text
        .replace(/\r/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]+/g, " ")
        .trim();

    if (!cleanedText) {
        return [];
    }

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: [
            "\n\n",
            "\n",
            ". ",
            "? ",
            "! ",
            "; ",
            ", ",
            " ",
            ""
        ] // to remove carriage returns, many blanks, tab spaces etc to clean the output
    });

    const chunks = await splitter.createDocuments([cleanedText]);

    return chunks.map((chunk, index) => ({
        chunkIndex: index,
        text: chunk.pageContent,
        metadata: chunk.metadata
    }));
};