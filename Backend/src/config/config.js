import { GoogleGenAI } from "@google/genai";

// Ensure the API key is present in environment variables
if (!process.env.GEMINI_API_KEY) {
    console.warn("Warning: GEMINI_API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export default ai;