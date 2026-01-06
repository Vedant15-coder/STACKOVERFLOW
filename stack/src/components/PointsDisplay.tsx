import React, { useEffect, useState } from "react";
import axios from "../lib/axiosinstance";

interface PointsDisplayProps {
    userId?: string;
    showBadge?: boolean;
    className?: string;
}

interface PointsBreakdown {
    fromAnswers: number;
    fromMilestones: number;
    fromTransfers: number;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({
    userId,
    showBadge = false,
    className = "",
}) => {
    const [points, setPoints] = useState<number>(0);
    const [breakdown, setBreakdown] = useState<PointsBreakdown>({
        fromAnswers: 0,
        fromMilestones: 0,
        fromTransfers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const token = localStorage.getItem("token");
                const endpoint = userId
                    ? `/api/rewards/user/${userId}`
                    : "/api/rewards/my-points";

                const config = userId
                    ? {}
                    : {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };

                const response = await axios.get(endpoint, config);
                setPoints(response.data.points || 0);

                // Fetch transaction history to calculate breakdown
                const historyEndpoint = userId
                    ? `/api/rewards/transactions/${userId}?limit=1000`
                    : `/api/rewards/transactions?limit=1000`;

                const historyResponse = await axios.get(historyEndpoint, config);
                const transactions = historyResponse.data.transactions || [];

                // Calculate breakdown
                let answersTotal = 0;
                let milestonesTotal = 0;
                let transfersTotal = 0;

                transactions.forEach((t: any) => {
                    if (t.reason === "answer_posted") answersTotal += t.points;
                    if (t.reason === "upvote_milestone") milestonesTotal += t.points;
                    if (t.reason === "upvote_milestone_revoked") milestonesTotal += t.points;
                    if (t.reason === "transfer_sent" || t.reason === "transfer_received")
                        transfersTotal += t.points;
                });

                setBreakdown({
                    fromAnswers: answersTotal,
                    fromMilestones: milestonesTotal,
                    fromTransfers: transfersTotal,
                });
            } catch (error) {
                console.error("Error fetching points:", error);
                setPoints(0);
            } finally {
                setLoading(false);
            }
        };

        fetchPoints();
    }, [userId]);

    if (loading) {
        return <span className={className}>Loading...</span>;
    }

    // Compact badge mode (for navbar/inline)
    if (showBadge) {
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium text-gray-700 ${className}`}
                title={`${points} reputation points`}
            >
                <span className="text-yellow-600">⭐</span>
                <span className="font-bold">{points}</span>
            </span>
        );
    }

    // Full reputation card display
    return (
        <div className={`${className}`}>
            {/* Main Points Display */}
            <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">🏆</div>
                <div>
                    <div className="text-4xl font-bold text-gray-900">{points}</div>
                    <div className="text-sm text-gray-500 font-medium">Reputation Points</div>
                </div>
            </div>

            {/* Breakdown */}
            {(breakdown.fromAnswers !== 0 ||
                breakdown.fromMilestones !== 0 ||
                breakdown.fromTransfers !== 0) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Breakdown
                        </div>
                        <div className="space-y-1.5 text-sm">
                            {breakdown.fromAnswers !== 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">From Answers</span>
                                    <span className="font-semibold text-green-600">
                                        {breakdown.fromAnswers > 0 ? "+" : ""}
                                        {breakdown.fromAnswers}
                                    </span>
                                </div>
                            )}
                            {breakdown.fromMilestones !== 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">From Upvote Milestones</span>
                                    <span className="font-semibold text-yellow-600">
                                        {breakdown.fromMilestones > 0 ? "+" : ""}
                                        {breakdown.fromMilestones}
                                    </span>
                                </div>
                            )}
                            {breakdown.fromTransfers !== 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">From Transfers</span>
                                    <span
                                        className={`font-semibold ${breakdown.fromTransfers > 0 ? "text-blue-600" : "text-red-600"
                                            }`}
                                    >
                                        {breakdown.fromTransfers > 0 ? "+" : ""}
                                        {breakdown.fromTransfers}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
};

export default PointsDisplay;
