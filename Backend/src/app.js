import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan"
import uploadRouter from "./routes/upload.routes.js";
import processRouter from "./routes/process.routes.js";
import extractionRoutes from "./routes/extraction.routes.js";


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "An unexpected error occurred."
    });
});

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

//Routing
app.use("/api/upload",uploadRouter)
app.use("/api/process", processRouter);
app.use("/api/extraction",extractionRoutes);



export default app;