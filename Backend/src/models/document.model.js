import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
    filename: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    fileId: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    mimeType: {
        type: String,
        default: "application/pdf",
    },
    fileSize: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: [
            "uploaded",
            "extracting",
            "extracted",
            "chunking",
            "chunked",
            "embedding",
            "completed",
            "failed"
        ],
        default: "uploaded"
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    },
    { timestamps: true }
);

const documentModel = mongoose.model('Document', documentSchema);

export default documentModel;