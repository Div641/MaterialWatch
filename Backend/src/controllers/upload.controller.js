import documentModel from "../models/document.model.js";
import { uploadFile } from "../services/storage.service.js";

export const uploadPDF = async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF.",
            });
        }

        const uploadedFile = await uploadFile({
            buffer: req.file.buffer,
            fileName: `${Date.now()}-${req.file.originalname}`,
        });

        const document = await documentModel.create({
            filename: uploadedFile.fileName,
            fileId: uploadedFile.fileId,
            url: uploadedFile.fileUrl,
            status: "uploaded",
        });

        return res.status(201).json({
            success: true,
            message: "PDF uploaded successfully.",
            document,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong.",
        });
    }
};