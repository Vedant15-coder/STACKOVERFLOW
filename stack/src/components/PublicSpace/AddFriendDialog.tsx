import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";

interface User {
    _id: string;
    name: string;
    email: string;
    joinDate: string;
}

interface AddFriendDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onFriendAdded: () => void;
}

export default function AddFriendDialog({ isOpen, onClose, onFriendAdded }: AddFriendDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingFriend, setAddingFriend] = useState<string | null>(null);

    // Search users when query changes
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.trim() === "") {
                setSearchResults([]);
                return;
            }

            setLoading(true);
            try {
                const res = await axiosInstance.get(`/friend/search?query=${searchQuery}`);
                setSearchResults(res.data.users);
            } catch (error) {
                console.error("Error searching users:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleAddFriend = async (userId: string) => {
        setAddingFriend(userId);
        try {
            const res = await axiosInstance.post(`/friend/add/${userId}`);
            toast.success(res.data.message);

            // Remove the added user from search results
            setSearchResults(prev => prev.filter(user => user._id !== userId));

            // Notify parent to refresh stats
            onFriendAdded();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to add friend";
            toast.error(message);
        } finally {
            setAddingFriend(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Add Friends</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search users by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                </div>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto px-4 pb-4">
                    {loading && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {!loading && searchQuery && searchResults.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No users found</p>
                    )}

                    {!loading && searchResults.length > 0 && (
                        <div className="space-y-2">
                            {searchResults.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddFriend(user._id)}
                                        disabled={addingFriend === user._id}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                        {addingFriend === user._id ? "Adding..." : "Add Friend"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!searchQuery && (
                        <p className="text-center text-gray-500 py-8">
                            Start typing to search for users
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
