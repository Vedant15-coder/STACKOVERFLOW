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

        // Try multiple models with fallback
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        let model;
        let lastError;

        for (const modelName of modelsToTry) {
            try {
                console.log(`🤖 Trying Gemini model: ${modelName}`);
                model = genAI.getGenerativeModel({ model: modelName });

                // Test the model with the actual prompt
                const prompt = `You are a helpful programming assistant on Stack Overflow. 
A user has asked the following question:

${question}

Please provide a clear, concise, and helpful answer. If it's a coding question, include code examples with explanations. Format your response in a way that's easy to read and understand.`;

                console.log("💭 Generating response for question:", question.substring(0, 50) + "...");
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                console.log(`✅ Response generated successfully using ${modelName}`);
                return res.status(200).json({
                    success: true,
                    answer: text,
                    model: modelName
                });
            } catch (error) {
                console.log(`❌ Model ${modelName} failed:`, error.message);
                lastError = error;
                continue; // Try next model
            }
        }

        // If all models failed, throw the last error
        throw lastError || new Error("All Gemini models failed");
    } catch (error) {
        console.error("❌ Gemini AI Error:");
        console.error("Error message:", error.message);
        console.error("Error status:", error.status);
        console.error("Error statusText:", error.statusText);

        // Provide user-friendly error messages
        let errorMessage = "AI service temporarily unavailable";

        if (error.status === 429) {
            errorMessage = "AI is temporarily busy. Please try again in a minute.";
        } else if (error.status === 404) {
            errorMessage = "AI model not available. The API key may be invalid or expired. Please check your Gemini API key.";
        } else if (error.status === 400) {
            errorMessage = "Invalid request to AI service. Please try again.";
        } else if (error.message?.includes("API key")) {
            errorMessage = "Invalid API key. Please check your GEMINI_API_KEY in the .env file.";
        } else if (error.message) {
            errorMessage = `AI Error: ${error.message}`;
        }

        return res.status(500).json({
            success: false,
            message: errorMessage,
            debug: process.env.NODE_ENV === 'development' ? {
                error: error.message,
                status: error.status,
                statusText: error.statusText
            } : undefined
        });
    }
};
