
import { runExtractionForDocument } from "../services/runExtraction.service.js";

export const runExtraction = async (req, res) => {

    try {

        const { documentId, query } = req.body;

        const extraction = await runExtractionForDocument(
            documentId,
            query
        );

        return res.json({
            success: true,
            extraction
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};