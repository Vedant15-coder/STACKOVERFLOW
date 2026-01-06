import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { Search, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface User {
    _id: string;
    name: string;
    email: string;
}

export default function FriendSearchWidget() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingFriend, setAddingFriend] = useState<string | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);

    // Prevent hydration errors by only rendering after mount
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Load all users on mount (only if authenticated)
    useEffect(() => {
        if (user && hasMounted) {
            fetchUsers("");
        }
    }, [user, hasMounted]);

    // Search users when query changes
    useEffect(() => {
        if (initialLoad) {
            setInitialLoad(false);
            return;
        }

        if (!user) {
            return;
        }

        const debounceTimer = setTimeout(() => {
            fetchUsers(searchQuery);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, user]);

    const fetchUsers = async (query: string) => {
        setLoading(true);
        try {
            const url = query.trim()
                ? `/friend/search?query=${encodeURIComponent(query)}`
                : `/friend/search`;
            const res = await axiosInstance.get(url);
            setSearchResults(res.data.users || []);
        } catch (error: any) {
            console.error("Error searching users:", error);
            console.error("Error details:", error.response?.data);
            setSearchResults([]);
            if (error.response?.status === 500) {
                toast.error("Server error loading users. Please refresh the page.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (userId: string, userName: string) => {
        setAddingFriend(userId);
        try {
            await axiosInstance.post(`/friend/request/${userId}`);
            toast.success(`Friend request sent to ${userName}!`);

            // Remove the added user from search results
            setSearchResults(prev => prev.filter(user => user._id !== userId));
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to send friend request";
            toast.error(message);
        } finally {
            setAddingFriend(null);
        }
    };

    // Prevent hydration errors - don't render until mounted
    if (!hasMounted) {
        return (
            <div className="bg-white border border-gray-200 rounded p-3 lg:p-4">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Find Friends
                </h3>
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded p-3 lg:p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Find Friends
            </h3>

            {/* Show login prompt if not authenticated */}
            {!user ? (
                <div className="text-center py-6 px-3">
                    <LogIn className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">Please log in to search for friends</p>
                    <p className="text-xs text-gray-500">You need to be authenticated to use this feature</p>
                </div>
            ) : (
                <>
                    {/* Search Input */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Search Results */}
                    <div className="max-h-64 overflow-y-auto">
                        {loading && (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {!loading && searchResults.length === 0 && (
                            <p className="text-center text-gray-500 text-xs py-4">
                                {searchQuery ? "No users found" : "No users available"}
                            </p>
                        )}

                        {!loading && searchResults.length > 0 && (
                            <div className="space-y-2">
                                {searchResults.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50"
                                    >
                                        <div className="flex-1 min-w-0 mr-2">
                                            <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddFriend(user._id, user.name)}
                                            disabled={addingFriend === user._id}
                                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            {addingFriend === user._id ? "Adding..." : "Add"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
