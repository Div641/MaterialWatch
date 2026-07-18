import { retrieveRelevantChunks } from "../services/rag.service.js";

export const testRetriever = async (req, res) => {

    try {

        const { documentId, query } = req.body;

        if (!documentId || !query) {

            return res.status(400).json({
                success: false,
                message: "documentId and query required"
            });

        }

        const chunks = await retrieveRelevantChunks({
            documentId,
            query
        });

        res.json({

            success: true,
            chunks

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};