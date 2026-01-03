import { useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import ShareDialog from "./ShareDialog";

interface Post {
    _id: string;
    author: {
        _id: string;
        name: string;
        email: string;
    };
    caption: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    likes: string[];
    comments: Array<{
        _id: string;
        author: {
            _id: string;
            name: string;
            email: string;
        };
        text: string;
        createdAt: string;
    }>;
    shares: number;
    createdAt: string;
}

interface PostCardProps {
    post: Post;
    onUpdate: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
    const { user } = useAuth();
    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);

    const isLiked = user ? post.likes.includes(user._id) : false;

    const handleLike = async () => {
        try {
            await axiosInstance.post(`/public/like/${post._id}`);
            onUpdate();
        } catch (error: any) {
            console.error("Error liking post:", error);
            toast.error("Failed to like post");
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            await axiosInstance.post(`/public/comment/${post._id}`, {
                text: commentText.trim(),
            });
            setCommentText("");
            toast.success("Comment added!");
            onUpdate();
        } catch (error: any) {
            console.error("Error commenting:", error);
            toast.error("Failed to add comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleShare = () => {
        setShowShareDialog(true);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Author Info */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{post.author.name}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()} at{" "}
                            {new Date(post.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Caption */}
            <div className="p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{post.caption}</p>
            </div>

            {/* Media */}
            <div className="bg-gray-100">
                {post.mediaType === "image" ? (
                    <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full max-h-[500px] object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x400?text=Image+Not+Found";
                        }}
                    />
                ) : (
                    <video
                        src={post.mediaUrl}
                        controls
                        className="w-full max-h-[500px]"
                        onError={(e) => {
                            (e.target as HTMLVideoElement).poster = "https://via.placeholder.com/600x400?text=Video+Not+Found";
                        }}
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>

            {/* Stats */}
            <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                <span>{post.likes.length} {post.likes.length === 1 ? "like" : "likes"}</span>
                <div className="flex gap-4">
                    <span>{post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</span>
                    <span>{post.shares} {post.shares === 1 ? "share" : "shares"}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-2 border-t border-gray-200 flex items-center gap-2">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-100 transition ${isLiked ? "text-red-600" : "text-gray-600"
                        }`}
                >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                    <span className="text-sm font-medium">Like</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-100 transition text-gray-600"
                >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Comment</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-100 transition text-gray-600"
                >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {/* Comment Form */}
                    <form onSubmit={handleComment} className="mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                disabled={submitting}
                            />
                            <button
                                type="submit"
                                disabled={submitting || !commentText.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3">
                        {post.comments.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-2">No comments yet</p>
                        ) : (
                            post.comments.map((comment) => (
                                <div key={comment._id} className="bg-white rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                            {comment.author.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-gray-900">
                                                {comment.author.name}
                                            </p>
                                            <p className="text-sm text-gray-800 mt-1">{comment.text}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                                                {new Date(comment.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Share Dialog */}
            <ShareDialog
                isOpen={showShareDialog}
                onClose={() => setShowShareDialog(false)}
                postId={post._id}
                onShared={onUpdate}
            />
        </div>
    );
}
