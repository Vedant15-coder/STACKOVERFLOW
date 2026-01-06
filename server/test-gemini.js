import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testGemini() {
    try {
        console.log("Testing Gemini API...");
        console.log("API Key:", process.env.GEMINI_API_KEY?.substring(0, 20) + "...");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        console.log("Sending test prompt...");
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        const text = response.text();

        console.log("✅ SUCCESS! Response:", text);
    } catch (error) {
        console.error("❌ ERROR:", error.message);
        console.error("Full error:", error);
    }
}

testGemini();
