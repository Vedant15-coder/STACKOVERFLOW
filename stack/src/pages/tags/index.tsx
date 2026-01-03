import { Input } from "@/components/ui/input";
import Mainlayout from "@/layout/Mainlayout";
import { Search, Tag } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const sampleTags = [
    {
        id: 1,
        name: "javascript",
        description: "For questions about programming in ECMAScript (JavaScript/JS)",
        questionCount: 2450000,
    },
    {
        id: 2,
        name: "python",
        description: "For questions about the Python programming language",
        questionCount: 2100000,
    },
    {
        id: 3,
        name: "java",
        description: "For questions about the Java programming language",
        questionCount: 1850000,
    },
    {
        id: 4,
        name: "react",
        description: "For questions about React, a JavaScript library for building user interfaces",
        questionCount: 520000,
    },
    {
        id: 5,
        name: "node.js",
        description: "For questions about Node.js, a JavaScript runtime built on Chrome's V8",
        questionCount: 480000,
    },
    {
        id: 6,
        name: "typescript",
        description: "For questions about TypeScript, a typed superset of JavaScript",
        questionCount: 350000,
    },
    {
        id: 7,
        name: "html",
        description: "For questions about HyperText Markup Language",
        questionCount: 1200000,
    },
    {
        id: 8,
        name: "css",
        description: "For questions about Cascading Style Sheets",
        questionCount: 950000,
    },
];

const TagsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [tags] = useState(sampleTags);

    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Mainlayout>
            <div className="max-w-6xl">
                <h1 className="text-xl lg:text-2xl font-semibold mb-6">Tags</h1>

                <p className="text-gray-600 mb-6">
                    A tag is a keyword or label that categorizes your question with other,
                    similar questions. Using the right tags makes it easier for others to
                    find and answer your question.
                </p>

                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Filter by tag name"
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTags.map((tag) => (
                        <div
                            key={tag.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex items-center mb-2">
                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
                                    {tag.name}
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {tag.description}
                            </p>

                            <div className="text-xs text-gray-500">
                                {tag.questionCount.toLocaleString()} questions
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTags.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        No tags found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </Mainlayout>
    );
};

export default TagsPage;
