import documentModel from "../models/document.model.js";
import { uploadFile } from "../services/storage.service.js";

export const uploadPDF = async (req, res) => {

    try {

        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No PDF files uploaded."
            });
        }

        // Upload all files to ImageKit concurrently
        const uploadPromises = req.files.map(async (file) => {
            const uploadedFile = await uploadFile({
                buffer: file.buffer,
                fileName: `${Date.now()}-${file.originalname}`,
            });
            return {
                filename: uploadedFile.fileName,
                fileId: uploadedFile.fileId,
                url: uploadedFile.fileUrl,
                status: "uploaded",
            };
        });
        const filesData = await Promise.all(uploadPromises);
        // Save all records in MongoDB under Document collection
        const documents = await documentModel.insertMany(filesData);


        return res.status(201).json({
            success: true,
            message: `${uploadedDocuments.length} PDFs uploaded successfully.`,
            totalUploaded: uploadedDocuments.length,
            documents: uploadedDocuments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong.",
        });
    }
};