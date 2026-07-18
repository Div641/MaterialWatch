import express from "express";
import { testRetriever } from "../controllers/extraction.controller.js";

const router = express.Router();

router.post("/retrieve",testRetriever);

export default router;