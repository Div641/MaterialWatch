import Extraction from "../models/extraction.model.js";

export const getExtraction = async (req, res) => {

    try {

        const extraction = await Extraction.findOne({
            document: req.params.documentId
        });

        if (!extraction) {
            return res.status(404).json({
                success: false,
                message: "Extraction not found"
            });
        }

        return res.json({
            success: true,
            extraction: extraction.extraction
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};