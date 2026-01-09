import { HfInference } from "@huggingface/inference";

export const askAI = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: "Question required" });
        }

        console.log("🤖 Sending request to Hugging Face...");
        console.log("Question:", question);

        const hf = new HfInference(process.env.HF_API_KEY);

        // Using Meta Llama 3.2 which has Inference Provider support
        const response = await hf.chatCompletion({
            model: "meta-llama/Llama-3.2-3B-Instruct",
            messages: [
                {
                    role: "user",
                    content: question,
                },
            ],
            max_tokens: 200,
            temperature: 0.7,
        });

        console.log("✅ Received response from Hugging Face");
        console.log("Response:", JSON.stringify(response, null, 2));

        let answer = response.choices[0]?.message?.content || "No response generated";

        // Clean up the response
        if (answer && answer.trim()) {
            answer = answer.trim();
        } else {
            answer = "AI is warming up. Please try again in a few seconds.";
        }

        return res.status(200).json({ answer });
    } catch (error) {
        console.error("❌ HF API ERROR:");
        console.error("Error message:", error.message);
        console.error("Error name:", error.name);

        let errorMsg = "AI service is currently unavailable. Please try again later.";

        if (error.message?.toLowerCase().includes("loading")) {
            errorMsg = "Model is loading. Please wait 30 seconds and try again.";
        } else if (error.message?.toLowerCase().includes("rate")) {
            errorMsg = "Too many requests. Please wait a minute and try again.";
        } else if (error.message?.toLowerCase().includes("provider")) {
            errorMsg = "Model provider unavailable. Please try again in a moment.";
        } else if (error.message?.toLowerCase().includes("gated") || error.message?.toLowerCase().includes("access")) {
            errorMsg = "This model requires special access. Using alternative approach...";
        }

        return res.status(200).json({ answer: errorMsg });
    }
};
