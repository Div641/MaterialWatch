import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        filename:{
            type:String,
            required:true
        },
        status:{
            type:String ,
            enum: ["uploaded", "processing", "completed", "failed"],
            default: "uploaded",
        },
        uploadedAt:{
            type:Date,
            default: Date.now,
            immutable:true,
            required:true
        }
    },
    { timestamps: true }
);

const documentModel = mongoose.model('Document', documentSchema);

export default documentModel;