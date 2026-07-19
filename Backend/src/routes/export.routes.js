import express from "express";
import {exportExtractions,} from "../controllers/export.controller.js";


const router = express.Router();

router.get("/", exportExtractions);

export default router;