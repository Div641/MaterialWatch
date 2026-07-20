import fs from "fs/promises";
import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config();

import Extraction from "../src/models/extraction.model.js";
import Document from "../src/models/document.model.js";

await mongoose.connect(process.env.MONGO_URI);

const extractions = await Extraction.find().populate(
    "document",
    "filename"
);

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
    const record = item.extraction?.extractions?.[0];
    if (!record) continue;
    output.push(record);
    if (documentsByCategory[record.event_category] !== undefined) {
        documentsByCategory[record.event_category]++;
    }
}

const allDocuments = await Document.find();

const processedIds = new Set(
    extractions
        .filter((doc) => doc.document)
        .map((doc) => doc.document._id.toString())
);

for (const doc of allDocuments) {
    if (!processedIds.has(doc._id.toString())) {
        failedDocuments.push(doc.filename);
    }
}

const finalOutput = {

    extractions: output,

    summary: {
        total_documents_processed: output.length,
        documents_by_category: documentsByCategory,
        documents_that_failed_processing: failedDocuments,
    },

};

await fs.writeFile(
    "output.json",
    JSON.stringify(finalOutput, null, 2)
);

console.log("output.json generated successfully.");

await mongoose.disconnect();