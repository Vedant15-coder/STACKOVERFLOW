import { useState, useEffect } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import CreatePost from "@/components/PublicSpace/CreatePost";
import PostFeed from "@/components/PublicSpace/PostFeed";
import AddFriendDialog from "@/components/PublicSpace/AddFriendDialog";
import { toast } from "react-toastify";

interface Stats {
    friendCount: number;
    dailyLimit: number | "unlimited";
    postsToday: number;
    canPost: boolean;
}

export default function PublicSpace() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [hasMounted, setHasMounted] = useState(false);
    const [showAddFriendDialog, setShowAddFriendDialog] = useState(false);

    // Fix hydration error
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Fetch user stats
    const fetchStats = async () => {
        try {
            const res = await axiosInstance.get("/public/my-stats");
            setStats(res.data.stats);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Fetch all posts
    const fetchPosts = async () => {
        try {
            const res = await axiosInstance.get("/public/feed");
            setPosts(res.data.posts);
        } catch (error) {
            console.error("Error fetching posts:", error);
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasMounted && user) {
            fetchStats();
            fetchPosts();
        } else if (hasMounted && !user) {
            setLoading(false);
        }
    }, [user, hasMounted]);

    const handlePostCreated = () => {
        fetchStats();
        fetchPosts();
    };

    if (!hasMounted) {
        return (
            <Mainlayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </Mainlayout>
        );
    }

    if (!user) {
        return (
            <Mainlayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-gray-600">Please log in to view Public Space</p>
                </div>
            </Mainlayout>
        );
    }

    return (
        <Mainlayout>
            <main className="min-w-0 p-4 lg:p-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Public Space</h1>

                    {/* User Stats */}
                    {stats && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Friends: <span className="font-semibold">{stats.friendCount}</span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Daily Limit:{" "}
                                        <span className="font-semibold">
                                            {stats.dailyLimit === "unlimited" ? "Unlimited" : stats.dailyLimit}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Posts Today: <span className="font-semibold">{stats.postsToday}</span>
                                    </p>
                                </div>
                                {!stats.canPost && (
                                    <div className="text-sm text-red-600 font-medium">
                                        {stats.friendCount === 0 ? (
                                            <button
                                                onClick={() => setShowAddFriendDialog(true)}
                                                className="text-red-600 hover:text-red-700 underline cursor-pointer"
                                            >
                                                Add friends to start posting
                                            </button>
                                        ) : (
                                            "Daily limit reached"
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Create Post */}
                    {stats?.canPost && (
                        <CreatePost onPostCreated={handlePostCreated} />
                    )}

                    {/* Posts Feed */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <PostFeed posts={posts} onUpdate={fetchPosts} />
                    )}
                </div>
            </main>

            {/* Add Friend Dialog */}
            <AddFriendDialog
                isOpen={showAddFriendDialog}
                onClose={() => setShowAddFriendDialog(false)}
                onFriendAdded={() => {
                    fetchStats();
                    setShowAddFriendDialog(false);
                }}
            />
        </Mainlayout>
    );
}
