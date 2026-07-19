//gemini extraction using the retrieved data
import Document from "../models/document.model.js";
import Extraction from "../models/extraction.model.js";

import { retrieveRelevantChunks } from "./rag.service.js";
import { extractStructuredData } from "./extraction.service.js";

export const runExtractionForDocument = async (
    documentId,
    query = "Extract all material financial disclosure information."
) => {

    const document = await Document.findById(documentId);

    if (!document) {
        throw new Error("Document not found.");
    }

    const chunks = await retrieveRelevantChunks({
        documentId,
        query
    });

    if (!chunks.length) {
        throw new Error("No relevant chunks found.");
    }

    const context = chunks
        .map(
            (chunk, index) =>
                `Chunk ${index + 1}\n${chunk.text}`
        )
        .join("\n\n");

    const extraction = await extractStructuredData(
        context,
        document.filename
    );

    const cleaned = extraction
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const parsed = JSON.parse(cleaned);

    await Extraction.findOneAndUpdate(
        {
            document: documentId
        },
        {
            extraction: parsed
        },
        {
            upsert: true,
            new: true
        }
    );
    return parsed;
};