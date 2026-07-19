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


// Health check
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

//Routing
app.use("/api/upload",uploadRouter)
app.use("/api/process", processRouter);
app.use("/api/extraction",extractionRoutes);


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global Error Handler (LAST)
app.use((err, req, res, next) => {

    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });

});

export default app;