import { GoogleGenerativeAI } from "@google/generative-ai";

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

        // Initialize Gemini AI with current API key
        console.log("🔑 Initializing Gemini with API key:", process.env.GEMINI_API_KEY?.substring(0, 20) + "...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Get the generative model (NO models/ prefix for SDK v0.24.1)
        console.log("🤖 Getting Gemini model: gemini-1.5-flash");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create a prompt that's optimized for Stack Overflow-style questions
        const prompt = `You are a helpful programming assistant on Stack Overflow. 
A user has asked the following question:

${question}

Please provide a clear, concise, and helpful answer. If it's a coding question, include code examples with explanations. Format your response in a way that's easy to read and understand.`;

        // Generate content
        console.log("💭 Generating response for question:", question.substring(0, 50) + "...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ Response generated successfully");
        return res.status(200).json({
            success: true,
            answer: text,
        });
    } catch (error) {
        console.error("❌ Gemini AI Error:", error);

        // Provide user-friendly error messages
        let errorMessage = "AI service temporarily unavailable";

        if (error.status === 429) {
            errorMessage = "AI is temporarily busy. Please try again in a minute.";
        } else if (error.status === 404) {
            errorMessage = "AI model not available. Please try again later.";
        }

        return res.status(500).json({
            success: false,
            message: errorMessage,
        });
    }
};
