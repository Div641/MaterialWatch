import { Router } from "express";
import { processDocument } from "../controllers/process.controller.js";

const processRouter = Router();

processRouter.post("/:id", processDocument);

export default processRouter;