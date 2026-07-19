import express from "express";
import { runExtraction } from "../controllers/extraction.controller.js";
import { getExtraction } from "../controllers/extractionStorage.controller.js";
import { runAllExtractions } from "../controllers/batch.controller.js";

const router = express.Router();


router.post("/run",runExtraction)
router.get("/:documentId",getExtraction)
router.post("/run-all", runAllExtractions)

export default router;