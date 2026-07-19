import express from "express";
import { runExtraction } from "../controllers/extraction.controller.js";

const router = express.Router();


router.post("/run",runExtraction)

export default router;