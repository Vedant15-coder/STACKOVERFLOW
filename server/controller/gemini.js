import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Ask Gemini AI a question
export const askGemini = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Question is required",
            });
        }

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.",
            });
        }

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Create a prompt that's optimized for Stack Overflow-style questions
        const prompt = `You are a helpful programming assistant on Stack Overflow. 
A user has asked the following question:

${question}

Please provide a clear, concise, and helpful answer. If it's a coding question, include code examples with explanations. Format your response in a way that's easy to read and understand.`;

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            success: true,
            answer: text,
        });
    } catch (error) {
        console.error("Gemini AI Error:", error);

        // Provide more specific error messages
        let errorMessage = "Failed to get AI response";

        if (error.message && error.message.includes("API key")) {
            errorMessage = "Invalid Gemini API key. Please check your GEMINI_API_KEY in the .env file and ensure it's valid.";
        } else if (error.message && error.message.includes("quota")) {
            errorMessage = "API quota exceeded. Please check your Gemini API usage limits.";
        } else if (error.message && error.message.includes("network")) {
            errorMessage = "Network error. Please check your internet connection.";
        }

        return res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message,
        });
    }
};
