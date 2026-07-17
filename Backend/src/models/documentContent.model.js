import mongoose from "mongoose";

const documentContentSchema = new mongoose.Schema(
    {
        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true,
            unique: true
        },

        text: {
            type: String,
            default: ""
        },

        extractionStatus: {
            type: String,
            enum: [
                "pending",
                "processing",
                "completed",
                "failed"
            ],
            default: "pending"
        },

        chunkStatus: {
            type: String,
            enum: [
                "pending",
                "processing",
                "completed",
                "failed"
            ],
            default: "pending"
        },

        embeddingStatus: {
            type: String,
            enum: [
                "pending",
                "processing",
                "completed",
                "failed"
            ],
            default: "pending"
        },

        metadata: {
            pageCount: {
                type: Number,
                default: 0
            },

            wordCount: {
                type: Number,
                default: 0
            },

            characterCount: {
                type: Number,
                default: 0
            }
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    "DocumentContent",
    documentContentSchema
);