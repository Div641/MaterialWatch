import { Router} from "express"
import upload from "../middlewares/upload.middleware.js"
import { uploadPDF } from "../controllers/upload.controller.js";

const uploadRouter= Router();


uploadRouter.post("/pdf",upload.single("pdf"),uploadPDF);


export default uploadRouter;