import Extraction from "../models/extraction.model.js";
import Document from "../models/document.model.js";

export const exportExtractions = async (req, res) => {

    try {

        const extractions = await Extraction.find()
            .populate("document" , "filename");

        const documentsByCategory = {
            dividend_declaration: 0,
            credit_rating_action: 0,
            financial_results: 0,
            board_composition_change: 0,
            other: 0,
        };

        const failedDocuments = [];

        const output = [];

        for (const item of extractions) {

            const extraction = item.extraction;

            if (!extraction) continue;

            const record = extraction.extractions?.[0];

            if (!record) continue;

            output.push(record);
            if (
                documentsByCategory.hasOwnProperty(
                    record.event_category
                )
            ) {
                documentsByCategory[record.event_category]++;
            }
        }

        output.sort((a, b) =>
            (a.source_filename || "").localeCompare(
                b.source_filename || ""
            )
        );

        const allDocuments = await Document.find();

        const extractedDocumentIds = new Set(
            extractions.filter((e) => e.document)
            .map((e) => e.document._id.toString())
        );

        for (const doc of allDocuments) {
            if (
                !extractedDocumentIds.has(
                    doc._id.toString()
                )
            ) {
                failedDocuments.push(
                    doc.filename
                );
            }
        }

        return res.status(200).json({
            extractions: output,
            summary: {
                total_documents_processed:
                    output.length,
                documents_by_category:
                    documentsByCategory,
                documents_that_failed_processing:
                    failedDocuments,
            },
        });
    } catch (err) {
        return res.status(500).json({
         success: false,
            message: err.message,
        });

    }

};