import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Bot, Send, Sparkles } from "lucide-react";
import { useState } from "react";

interface Message {
    id: number;
    type: "user" | "ai";
    content: string;
    timestamp: Date;
}

export default function AIAssist() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!question.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now(),
            type: "user",
            content: question,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setQuestion("");
        setLoading(true);

        try {
            const response = await axiosInstance.post("/ai/ask", {
                question: question,
            });

            // Add AI response
            const aiMessage: Message = {
                id: Date.now() + 1,
                type: "ai",
                content: response.data.answer || response.data.result || response.data.message,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error: any) {
            console.error("AI Error:", error);

            // Get the error message from the response or use a default
            let errorText = "Sorry, I encountered an error. Please try again later.";

            if (error.response?.data?.error) {
                errorText = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorText = error.response.data.message;
            } else if (error.message) {
                errorText = error.message;
            }

            // Add error message
            const errorMessage: Message = {
                id: Date.now() + 1,
                type: "ai",
                content: errorText,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Mainlayout>
            <main className="min-w-0 p-4 lg:p-6 h-[calc(100vh-53px)] flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-semibold">AI Assist</h1>
                        <p className="text-sm text-gray-600">
                            Powered by Hugging Face
                        </p>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-gray-50 rounded-lg p-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <Bot className="w-16 h-16 text-gray-300 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                Welcome to AI Assist!
                            </h2>
                            <p className="text-gray-500 max-w-md">
                                Ask me anything about programming, debugging, or coding best
                                practices. I'm here to help!
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-4 ${message.type === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white border border-gray-200"
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {message.type === "ai" && (
                                            <Bot className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {message.content}
                                            </p>
                                            <p
                                                className={`text-xs mt-2 ${message.type === "user"
                                                    ? "text-blue-100"
                                                    : "text-gray-500"
                                                    }`}
                                            >
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-lg p-4 bg-white border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <Bot className="w-5 h-5 text-blue-600" />
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask me anything about programming..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                </form>
            </main>
        </Mainlayout>
    );
}
