import { retrieveRelevantChunks } from "../services/rag.service.js";
import { extractStructuredData } from "../services/extraction.service.js";
import Document from "../models/document.model.js";


export const runExtraction = async (req, res) => {

    try {
        const { documentId, query } = req.body;

        if (!documentId || !query) {
            return res.status(400).json({
                success: false,
                message: "documentId and query required"
            });
        }

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found."
            });
        }

        const chunks = await retrieveRelevantChunks({
            documentId,
            query
        });

        if (!chunks.length) {
            return res.status(404).json({
                success: false,
                message: "No relevant chunks found."
            });
        }

        const context= chunks.map(
                (chunk, index) =>
                    `Chunk ${index + 1}:\n${chunk.text}`
            )
            .join("\n\n");

        const extraction= await extractStructuredData(context , document.filename);

        const cleaned = extraction
        .replace(/```json/g,"")
        .replace(/```/g,"")
        .trim();

        let parsedExtraction;

        try {
            parsedExtraction = JSON.parse(cleaned);
        } catch {
            return res.status(500).json({
                success: false,
                message: "Gemini returned invalid JSON."
            });
        }


        return res.json({
            success:true,
            extraction:JSON.parse(cleaned)
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }

};