import React, { useState } from "react";
import axios from "../lib/axiosinstance";

interface TransferPointsProps {
    recipientId: string;
    recipientName: string;
    currentUserPoints: number;
    onSuccess?: () => void;
}

const TransferPoints: React.FC<TransferPointsProps> = ({
    recipientId,
    recipientName,
    currentUserPoints,
    onSuccess,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleTransfer = async () => {
        setError("");
        setSuccess("");

        const transferAmount = parseInt(amount);

        // Validation
        if (!transferAmount || transferAmount < 1) {
            setError("Minimum transfer amount is 1 point");
            return;
        }

        if (currentUserPoints <= 10) {
            setError("You need more than 10 points to transfer");
            return;
        }

        if (transferAmount > currentUserPoints) {
            setError("Insufficient balance");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "/api/rewards/transfer",
                {
                    toUserId: recipientId,
                    amount: transferAmount,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccess(`Successfully transferred ${transferAmount} points!`);
            setAmount("");

            // Call success callback after a delay
            setTimeout(() => {
                setIsOpen(false);
                setSuccess("");
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || "Transfer failed");
        } finally {
            setLoading(false);
        }
    };

    // Don't show button if user doesn't have enough points
    if (currentUserPoints <= 10) {
        return null;
    }

    const transferAmountNum = parseInt(amount) || 0;
    const isValid = transferAmountNum >= 1 && transferAmountNum <= currentUserPoints;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors shadow-sm"
            >
                Transfer Points
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Transfer Points
                            </h2>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4 space-y-4">
                            {/* Recipient Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="text-sm text-gray-600 mb-1">Transfer to</div>
                                <div className="font-semibold text-gray-900">{recipientName}</div>
                            </div>

                            {/* Balance Display */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Your balance:</span>
                                <span className="font-bold text-gray-900">
                                    {currentUserPoints} points
                                </span>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount to transfer
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={currentUserPoints}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                    placeholder="Enter amount"
                                    disabled={loading}
                                />
                            </div>

                            {/* Warning Message */}
                            {!error && !success && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                                    <span className="text-yellow-600 text-lg flex-shrink-0">⚠</span>
                                    <div className="text-sm text-yellow-800">
                                        <strong>Note:</strong> You must maintain more than 10 points to
                                        transfer.
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <span className="text-red-600 text-lg flex-shrink-0">✕</span>
                                    <div className="text-sm text-red-700">{error}</div>
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                                    <span className="text-green-600 text-lg flex-shrink-0">✓</span>
                                    <div className="text-sm text-green-700">{success}</div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end rounded-b-lg">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setError("");
                                    setSuccess("");
                                    setAmount("");
                                }}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTransfer}
                                disabled={loading || !isValid || success !== ""}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? "Transferring..." : "Confirm Transfer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TransferPoints;
