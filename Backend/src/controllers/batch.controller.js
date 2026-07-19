import Document from "../models/document.model.js";
import { runExtractionForDocument } from "../services/runExtraction.service.js";


export const runAllExtractions = async (req, res) => {

    try {
        const documents = await Document.find();

        const completed = [];
        const failed = [];

        for (const document of documents) {
            try {
                const extraction =
                    await runExtractionForDocument(document._id);

                completed.push(extraction);
            } catch (err) {
                failed.push({
                    filename: document.filename,
                    error: err.message
                });
            }
        }

        return res.json({
            success: true,
            processed: completed.length,
            failed: failed.length,
            failures: failed
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};