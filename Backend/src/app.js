import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan"
import uploadRouter from "./routes/upload.routes.js";

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



export default app;