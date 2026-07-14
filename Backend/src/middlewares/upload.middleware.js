//check krta ki pdf hai ya nhi and then destination pr unique name se save krta
import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads folder if it doesn't exist
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

//disk storage tells Multer :Save files on my computer.
const storage = multer.diskStorage({
    //finds where to store the file(ie destination of the file)
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    //unique filename generated for each pdf because 2 users can upload files with same name, and multer has to keep them separately
    //cb= callback
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(
            null,
            uniqueName + path.extname(file.originalname) //defines path for all devices 
        );
    },
});

//checks if it is a pdf or not
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
});

export default upload;
