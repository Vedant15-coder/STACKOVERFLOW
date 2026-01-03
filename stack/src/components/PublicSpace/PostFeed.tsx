import PostCard from "./PostCard";

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

interface PostFeedProps {
    posts: Post[];
    onUpdate: () => void;
}

export default function PostFeed({ posts, onUpdate }: PostFeedProps) {
    if (posts.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600">No posts yet. Be the first to share something!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <PostCard key={post._id} post={post} onUpdate={onUpdate} />
            ))}
        </div>
    );
}
