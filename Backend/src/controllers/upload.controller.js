import documentModel from "../models/document.model.js";

export const uploadPDF = async (req, res) => {
    try {
        // if no file received 
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No PDF uploaded",
            });
        }

        // Save document record
        const document = await documentModel.create({
            filename: req.file.filename,
            status: "uploaded",
        });

        return res.status(201).json({
            success: true,
            message: "PDF uploaded successfully",
            document,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Upload failed",
        });
    }
};