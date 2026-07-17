import Document from "../models/document.model.js";
import { processPDF } from "../services/pdf.service.js";
import DocumentContent from "../models/documentContent.model.js";
import Chunk from "../models/chunk.model.js";
import { chunkText } from "../services/chunk.service.js";


export const processDocument = async (req, res) => {
    let document;
    try {
        document = await Document.findById(req.params.id); //request recieve 

        if (!document) {
            return res.status(404).json({
                success:false,
                message:"Document not found"
            });
        }
        
        // Prevent duplicate processing
        if (document.status === "chunked") {
            return res.status(400).json({
                success: false,
                message: "Document already processed."
            });
        }

        //1-> ectract pdf using pdf service
        document.status = "extracting";
        await document.save();

        const extractedText = await processPDF(document.url); //calling pdf.service to get the processed text from pdf
        //everything in RAG will be done using the text

        //2->save text extracted using pdf-parse
        await DocumentContent.findOneAndUpdate(
            {
            document: document._id
            },
            {
            text: extractedText,
            extractionStatus: "completed",
            metadata: {
                wordCount: extractedText.split(/\s+/).length,
                characterCount: extractedText.length
                }
            },
            { upsert: true, new: true }
        ); //need of upsert parameter:
        //in mongo db:
        // document field is marked as unique: true. If a processing attempt fails at step 3 or later (such as during chunking or database insertion), any subsequent attempt to retry processing the same document will fail with a MongoDB duplicate key error (E11000) because DocumentContent.create(...) tries to insert a new document with the same document ID.

        document.status = "extracted";
        await document.save();

        //3-> chunk text
        const chunks = await chunkText(extractedText);

        //4-> prepare chunk document
        const chunkDocuments = chunks.map((chunk) => ({
            documentId: document._id,
            chunkIndex: chunk.chunkIndex,
            text: chunk.text,
            metadata: chunk.metadata
        }));

        //5->save chunks
        await Chunk.deleteMany({ documentId: document._id });//to verify that same chunk isn't saved repetetively
        await Chunk.insertMany(chunkDocuments);

        //6->update status to chunked
        document.status = "chunked";
        await document.save();

        await DocumentContent.findOneAndUpdate(
            { document: document._id },
            {
                chunkStatus: "completed"
            }
        );


        //finally response
        return res.status(200).json({
            success:true,
            message:"PDF processed successfully"
        });
    }catch (error) {
        if (document) {
            document.status = "failed";
            await document.save();
        }

        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });

    }
};