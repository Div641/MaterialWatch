//providing upload/delete files service
import imagekit from "../config/imagekit.js";

export const uploadFile = async ({
    buffer,
    fileName,
    folder = "/MaterialWatch",
}) => {

    try {
        const uploadedFile = await imagekit.upload({
            file: buffer,
            fileName,
            folder,
        });

        return {
            fileId: uploadedFile.fileId,
            fileName: uploadedFile.name,
            fileUrl: uploadedFile.url,
        };
    } catch (error) {
        throw new Error(`Image upload failed: ${error.message}`);
    }
};

export const deleteFile = async (fileId) => {
    try {
        await imagekit.deleteFile(fileId);
    } catch (error) {
        throw new Error(`Unable to delete file: ${error.message}`);
    }
};