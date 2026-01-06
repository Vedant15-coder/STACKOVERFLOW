import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
    try {
        console.log("Listing available Gemini models...");
        console.log("API Key:", process.env.GEMINI_API_KEY?.substring(0, 20) + "...");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Try to list models
        const models = await genAI.listModels();

        console.log("\n✅ Available models:");
        for (const model of models) {
            console.log(`- ${model.name}`);
            console.log(`  Display name: ${model.displayName}`);
            console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
            console.log("");
        }
    } catch (error) {
        console.error("❌ ERROR:", error.message);
        console.error("Full error:", error);
    }
}

listModels();
