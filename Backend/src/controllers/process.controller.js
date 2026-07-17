import Document from "../models/document.model.js";
import { processPDF } from "../services/pdf.service.js";
import DocumentContent from "../models/documentContent.model.js";

export const processDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id); //request recieve 
        if (!document) {
            return res.status(404).json({
                success:false,
                message:"Document not found"
            });
        }
        document.status = "extracting";
        await document.save();

        const extractedText = await processPDF(document.url); //calling pdf.service to get the processed text from pdf
        //everything in RAG will be done using the text
        await DocumentContent.create({
            document: document._id,
            text: extractedText,
            extractionStatus: "completed",
            metadata: {
                wordCount: extractedText.split(/\s+/).length,
                characterCount: extractedText.length
            }
        });
        document.status = "extracted";

        await document.save();

        return res.status(200).json({
            success:true,
            message:"PDF processed successfully"
        });

    }catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });

    }
};