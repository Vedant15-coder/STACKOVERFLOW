import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { X, Send } from "lucide-react";

interface Friend {
    _id: string;
    name: string;
    email: string;
}

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    onShared: () => void;
}

export default function ShareDialog({ isOpen, onClose, postId, onShared }: ShareDialogProps) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFriends();
        }
    }, [isOpen]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/friend/list");
            setFriends(res.data.friends);
        } catch (error) {
            console.error("Error fetching friends:", error);
            toast.error("Failed to load friends");
        } finally {
            setLoading(false);
        }
    };

    const toggleFriend = (friendId: string) => {
        const newSelected = new Set(selectedFriends);
        if (newSelected.has(friendId)) {
            newSelected.delete(friendId);
        } else {
            newSelected.add(friendId);
        }
        setSelectedFriends(newSelected);
    };

    const handleShare = async () => {
        if (selectedFriends.size === 0) {
            toast.error("Please select at least one friend to share with");
            return;
        }

        setSharing(true);
        try {
            // Share with each selected friend
            await axiosInstance.post(`/public/share/${postId}`, {
                friendIds: Array.from(selectedFriends)
            });

            toast.success(`Post shared with ${selectedFriends.size} ${selectedFriends.size === 1 ? 'friend' : 'friends'}!`);
            setSelectedFriends(new Set());
            onShared();
            onClose();
        } catch (error: any) {
            console.error("Error sharing post:", error);
            const message = error.response?.data?.message || "Failed to share post";
            toast.error(message);
        } finally {
            setSharing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Share Post</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Friends List */}
                <div className="max-h-96 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">You don't have any friends yet.</p>
                            <p className="text-sm text-gray-400 mt-2">Add friends to share posts with them!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 mb-3">
                                Select friends to share this post with:
                            </p>
                            {friends.map((friend) => (
                                <label
                                    key={friend._id}
                                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFriends.has(friend._id)}
                                        onChange={() => toggleFriend(friend._id)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{friend.name}</p>
                                        <p className="text-sm text-gray-500">{friend.email}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {friends.length > 0 && (
                    <div className="p-4 border-t bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">
                                {selectedFriends.size} {selectedFriends.size === 1 ? 'friend' : 'friends'} selected
                            </span>
                        </div>
                        <button
                            onClick={handleShare}
                            disabled={sharing || selectedFriends.size === 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {sharing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    Sharing...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Share Post
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
