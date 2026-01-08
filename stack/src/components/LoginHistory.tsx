import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import {
    Monitor,
    Smartphone,
    Tablet,
    Laptop,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface LoginHistoryEntry {
    _id: string;
    ipAddress: string;
    browser: string;
    browserVersion: string;
    os: string;
    deviceType: string;
    loginMethod: string;
    loginStatus: string;
    failureReason: string | null;
    createdAt: string;
}

interface LoginHistoryProps {
    userId: string;
}

const LoginHistory: React.FC<LoginHistoryProps> = ({ userId }) => {
    const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        // Reset history when userId changes
        setHistory([]);
        setPage(1);
        setIsInitialLoad(true);
        fetchLoginHistory(1, true, true);
    }, [userId]);

    const fetchLoginHistory = async (pageNum: number = page, reset: boolean = false, initial: boolean = false) => {
        try {
            setLoading(true);
            // First load: 2 records, subsequent loads: 5 records
            const limit = initial ? 2 : 5;
            const response = await axiosInstance.get(
                `/user/login-history/${userId}?page=${pageNum}&limit=${limit}`
            );

            const newData = response.data.data;
            const pagination = response.data.pagination;

            // Append new data or reset based on flag
            if (reset) {
                setHistory(newData);
            } else {
                setHistory(prev => [...prev, ...newData]);
            }

            // Check if there are more pages
            setHasMore(pagination.page < pagination.pages);
        } catch (error: any) {
            // Don't show toast for 403 errors (permission denied - viewing someone else's profile)
            if (error.response?.status !== 403) {
                toast.error(error.response?.data?.message || "Failed to load login history");
            }
            // Set empty history on error
            if (reset) {
                setHistory([]);
            }
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        setIsInitialLoad(false);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchLoginHistory(nextPage, false, false);
    };

    const showLess = () => {
        // Reset to initial state - show only first 2 records
        setHistory([]);
        setPage(1);
        setIsInitialLoad(true);
        fetchLoginHistory(1, true, true);
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType.toLowerCase()) {
            case "mobile":
                return <Smartphone className="w-5 h-5 text-blue-600" />;
            case "tablet":
                return <Tablet className="w-5 h-5 text-purple-600" />;
            case "laptop":
                return <Laptop className="w-5 h-5 text-green-600" />;
            case "desktop":
                return <Monitor className="w-5 h-5 text-gray-600" />;
            default:
                return <Monitor className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === "Success") {
            return (
                <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Success</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1 text-red-600">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Blocked</span>
            </div>
        );
    };

    const getMethodBadge = (method: string) => {
        const colors: Record<string, string> = {
            "Email OTP": "bg-blue-100 text-blue-800",
            "Password": "bg-gray-100 text-gray-800",
            "Bypassed": "bg-green-100 text-green-800",
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[method] || "bg-gray-100 text-gray-800"}`}>
                {method}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading && history.length === 0) {
        return (
            <Card>
                <CardContent className="py-10">
                    <div className="text-center text-gray-500">Loading login history...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Login History</CardTitle>
                <CardDescription>
                    View all login attempts and access details for your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                {history.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No login history found
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {history.map((entry) => (
                                <div
                                    key={entry._id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            {/* Device Icon */}
                                            <div className="mt-1">{getDeviceIcon(entry.deviceType)}</div>

                                            {/* Login Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-gray-900">
                                                        {entry.browser} {entry.browserVersion}
                                                    </h4>
                                                    {getMethodBadge(entry.loginMethod)}
                                                </div>

                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <span>
                                                            <strong>OS:</strong> {entry.os}
                                                        </span>
                                                        <span>
                                                            <strong>Device:</strong> {entry.deviceType}
                                                        </span>
                                                        <span>
                                                            <strong>IP:</strong> {entry.ipAddress}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <strong>Time:</strong> {formatDate(entry.createdAt)} IST
                                                    </div>
                                                    {entry.failureReason && (
                                                        <div className="text-red-600 mt-2">
                                                            <strong>Reason:</strong> {entry.failureReason}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="ml-4">{getStatusBadge(entry.loginStatus)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Load More and Show Less Buttons */}
                        <div className="flex justify-center gap-3 mt-6 pt-4 border-t">
                            {/* Load More Button */}
                            {hasMore && !loading && (
                                <Button
                                    variant="default"
                                    size="lg"
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                    Load More
                                </Button>
                            )}

                            {/* Show Less Button - only show if we have more than 2 records */}
                            {history.length > 2 && !loading && (
                                <Button
                                    variant="default"
                                    size="lg"
                                    onClick={showLess}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 15l7-7 7 7"
                                        />
                                    </svg>
                                    Show Less
                                </Button>
                            )}
                        </div>

                        {/* Loading indicator for Load More */}
                        {loading && history.length > 0 && (
                            <div className="flex justify-center mt-4">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">Loading more records...</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default LoginHistory;
