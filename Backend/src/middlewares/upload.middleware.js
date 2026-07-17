import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    //to check ki file type is a pdf
    if (file.mimetype !== "application/pdf") {
        return cb(new Error("Only PDF files are allowed."));
    }
    cb(null, true); //callback
};

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter,
});

export default upload;