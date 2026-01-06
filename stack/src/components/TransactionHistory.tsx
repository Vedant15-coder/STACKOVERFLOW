import React, { useEffect, useState } from "react";
import axios from "../lib/axiosinstance";

interface Transaction {
    _id: string;
    fromUser: { name: string } | null;
    toUser: { name: string };
    points: number;
    reason: string;
    createdAt: string;
}

interface TransactionHistoryProps {
    userId?: string;
    limit?: number;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
    userId,
    limit = 20,
}) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem("token");
                const endpoint = userId
                    ? `/api/rewards/transactions/${userId}?limit=${limit}`
                    : `/api/rewards/transactions?limit=${limit}`;

                const config = userId
                    ? {}
                    : {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };

                const response = await axios.get(endpoint, config);
                setTransactions(response.data.transactions || []);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [userId, limit]);

    const getReasonLabel = (reason: string) => {
        const labels: { [key: string]: string } = {
            answer_posted: "Answer Posted",
            upvote_milestone: "5 Upvotes Milestone",
            upvote_milestone_revoked: "Milestone Revoked",
            answer_deleted: "Answer Deleted",
            transfer_sent: "Points Sent",
            transfer_received: "Points Received",
        };
        return labels[reason] || reason;
    };

    const getReasonIcon = (reason: string) => {
        const icons: { [key: string]: string } = {
            answer_posted: "✓",
            upvote_milestone: "★",
            upvote_milestone_revoked: "↓",
            answer_deleted: "✕",
            transfer_sent: "→",
            transfer_received: "←",
        };
        return icons[reason] || "•";
    };

    const getReasonColor = (reason: string, points: number) => {
        // Green for earned points
        if (reason === "answer_posted" || reason === "transfer_received") {
            return {
                text: "text-green-700",
                bg: "bg-green-50",
                border: "border-green-200",
                icon: "text-green-600",
                points: "text-green-700 font-bold",
            };
        }
        // Gold for milestones
        if (reason === "upvote_milestone") {
            return {
                text: "text-yellow-700",
                bg: "bg-yellow-50",
                border: "border-yellow-200",
                icon: "text-yellow-600",
                points: "text-yellow-700 font-bold",
            };
        }
        // Red for deductions
        if (
            reason === "upvote_milestone_revoked" ||
            reason === "answer_deleted" ||
            reason === "transfer_sent"
        ) {
            return {
                text: "text-red-700",
                bg: "bg-red-50",
                border: "border-red-200",
                icon: "text-red-600",
                points: "text-red-700 font-bold",
            };
        }
        // Blue for neutral
        return {
            text: "text-blue-700",
            bg: "bg-blue-50",
            border: "border-blue-200",
            icon: "text-blue-600",
            points: "text-blue-700 font-bold",
        };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8 text-gray-500">
                <div className="animate-pulse">Loading activity...</div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-400 text-4xl mb-2">📊</div>
                <p className="text-gray-600 font-medium">No activity yet</p>
                <p className="text-sm text-gray-500 mt-1">
                    Start earning points by posting answers!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
            {transactions.map((transaction, index) => {
                const colors = getReasonColor(transaction.reason, transaction.points);
                const icon = getReasonIcon(transaction.reason);

                return (
                    <div
                        key={transaction._id}
                        className={`flex items-center justify-between p-3 ${colors.bg} ${index !== transactions.length - 1 ? "border-b border-gray-200" : ""
                            } hover:opacity-80 transition-opacity`}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Icon */}
                            <div
                                className={`flex-shrink-0 w-6 h-6 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center text-xs font-bold ${colors.icon}`}
                            >
                                {icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className={`font-medium ${colors.text} text-sm`}>
                                    {getReasonLabel(transaction.reason)}
                                </div>
                                {transaction.fromUser && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        from {transaction.fromUser.name}
                                    </div>
                                )}
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {formatDate(transaction.createdAt)}
                                </div>
                            </div>
                        </div>

                        {/* Points */}
                        <div className={`flex-shrink-0 text-right ml-3 ${colors.points} text-base`}>
                            {transaction.points > 0 ? "+" : ""}
                            {transaction.points}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TransactionHistory;
