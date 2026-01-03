import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { Bell, X, UserPlus, Share2, Heart, MessageCircle, Check } from "lucide-react";

interface Notification {
    _id: string;
    sender: {
        _id: string;
        name: string;
        email: string;
    };
    type: "friend_request" | "post_share" | "like" | "comment";
    message: string;
    post?: {
        _id: string;
        caption: string;
    };
    read: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showDropdown) {
            fetchNotifications();
        }
    }, [showDropdown]);

    const fetchUnreadCount = async () => {
        try {
            const res = await axiosInstance.get("/notification/unread-count");
            setUnreadCount(res.data.count || 0);
        } catch (error: any) {
            console.error("Error fetching unread count:", error);
            console.error("Error details:", error.response?.data);
            // Silently fail - don't show error to user for background polling
            setUnreadCount(0);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/notification/list");
            setNotifications(res.data.notifications || []);
        } catch (error: any) {
            console.error("Error fetching notifications:", error);
            console.error("Error details:", error.response?.data);
            setNotifications([]);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await axiosInstance.put(`/notification/read/${id}`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosInstance.put("/notification/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Error marking all as read:", error);
            toast.error("Failed to mark all as read");
        }
    };

    const handleAcceptFriend = async (notificationId: string, senderId: string) => {
        setActionLoading(notificationId);
        try {
            await axiosInstance.post(`/friend/accept/${senderId}`);
            toast.success("Friend request accepted!");
            markAsRead(notificationId);
            fetchNotifications();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to accept request";
            toast.error(message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectFriend = async (notificationId: string, senderId: string) => {
        setActionLoading(notificationId);
        try {
            await axiosInstance.post(`/friend/reject/${senderId}`);
            toast.success("Friend request rejected");
            markAsRead(notificationId);
            fetchNotifications();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to reject request";
            toast.error(message);
        } finally {
            setActionLoading(null);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "friend_request":
                return <UserPlus className="w-5 h-5 text-blue-600" />;
            case "post_share":
                return <Share2 className="w-5 h-5 text-green-600" />;
            case "like":
                return <Heart className="w-5 h-5 text-red-600" />;
            case "comment":
                return <MessageCircle className="w-5 h-5 text-purple-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[600px] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div>
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition ${!notification.read ? "bg-blue-50" : ""
                                                }`}
                                            onClick={() => !notification.read && markAsRead(notification._id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {getTimeAgo(notification.createdAt)}
                                                    </p>

                                                    {/* Friend Request Actions */}
                                                    {notification.type === "friend_request" && notification.message.includes("sent you") && (
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAcceptFriend(notification._id, notification.sender._id);
                                                                }}
                                                                disabled={actionLoading === notification._id}
                                                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:bg-gray-400"
                                                            >
                                                                {actionLoading === notification._id ? "..." : "Accept"}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRejectFriend(notification._id, notification.sender._id);
                                                                }}
                                                                disabled={actionLoading === notification._id}
                                                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:bg-gray-100"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Unread Indicator */}
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
