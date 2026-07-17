import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true,
            index: true,
        },
        chunkIndex: {
            type: Number,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        metadata: {
            page: Number,
            startChar: Number,
            endChar: Number,
        },
        embedding: {
            type: [Number],
            default: []
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Chunk", chunkSchema);