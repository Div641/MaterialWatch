import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan"
import uploadRouter from "./routes/upload.routes.js";
import processRouter from "./routes/process.routes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());


// Health check
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

//Routing
app.use("/upload",uploadRouter)
app.use("/process", processRouter);



export default app;