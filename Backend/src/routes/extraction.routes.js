import express from "express";
import { runExtraction } from "../controllers/extraction.controller.js";
import { getExtraction } from "../controllers/extractionStorage.controller.js";

const router = express.Router();


router.post("/run",runExtraction)
router.get("/:documentId",getExtraction)

export default router;