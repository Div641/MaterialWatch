import mongoose from "mongoose";

const extractionSchema = new mongoose.Schema(
    {
        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true,
            unique: true
        },

        extraction: {
            type: Object,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Extraction", extractionSchema);