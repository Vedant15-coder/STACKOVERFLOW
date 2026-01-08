import Post from "../models/post.js";
import User from "../models/auth.js";

// Helper function to check if user can post today
const canUserPost = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { allowed: false, message: "User not found" };
        }

        const friendCount = user.friends.length;

        // Rule 1: 0 friends = cannot post
        if (friendCount === 0) {
            return {
                allowed: false,
                message: "You need at least 1 friend to post in Public Space",
            };
        }

        // Check if we need to reset the daily counter
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastPost = user.lastPostDate ? new Date(user.lastPostDate) : null;
        const lastPostDay = lastPost ? new Date(lastPost.setHours(0, 0, 0, 0)) : null;

        // Reset counter if it's a new day
        if (!lastPostDay || lastPostDay.getTime() !== today.getTime()) {
            user.dailyPostCount = 0;
            user.lastPostDate = new Date();
            await user.save();
        }

        // Rule 2: More than 10 friends = unlimited posts
        if (friendCount > 10) {
            return { allowed: true, user };
        }

        // Rule 3: 1 friend = 1 post per day
        if (friendCount === 1 && user.dailyPostCount >= 1) {
            return {
                allowed: false,
                message: "You have reached your daily posting limit (1 post/day with 1 friend)",
            };
        }

        // Rule 4: 2 friends = 2 posts per day
        if (friendCount === 2 && user.dailyPostCount >= 2) {
            return {
                allowed: false,
                message: "You have reached your daily posting limit (2 posts/day with 2 friends)",
            };
        }

        // Rule 5: 3-10 friends = friend count posts per day
        if (friendCount >= 3 && friendCount <= 10 && user.dailyPostCount >= friendCount) {
            return {
                allowed: false,
                message: `You have reached your daily posting limit (${friendCount} posts/day with ${friendCount} friends)`,
            };
        }

        return { allowed: true, user };
    } catch (error) {
        console.error("Error checking post permission:", error);
        return { allowed: false, message: "Error checking permissions" };
    }
};

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { caption, mediaUrl, mediaType } = req.body;
        const userId = req.userId; // From JWT middleware

        if (!caption || !mediaUrl || !mediaType) {
            return res.status(400).json({
                success: false,
                message: "Caption, media URL, and media type are required",
            });
        }

        if (!["image", "video"].includes(mediaType)) {
            return res.status(400).json({
                success: false,
                message: "Media type must be 'image' or 'video'",
            });
        }

        // Check if user can post
        const permission = await canUserPost(userId);
        if (!permission.allowed) {
            return res.status(403).json({
                success: false,
                message: permission.message,
            });
        }

        // Create the post
        const newPost = new Post({
            author: userId,
            caption,
            mediaUrl,
            mediaType,
        });

        await newPost.save();

        // Increment user's daily post count
        permission.user.dailyPostCount += 1;
        permission.user.lastPostDate = new Date();
        await permission.user.save();

        // Populate author details
        await newPost.populate("author", "name email");

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: newPost,
        });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create post",
            error: error.message,
        });
    }
};

// Get all posts (feed)
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name email")
            .populate("comments.author", "name email")
            .sort({ createdAt: -1 }); // Reverse chronological order

        return res.status(200).json({
            success: true,
            posts,
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch posts",
            error: error.message,
        });
    }
};

// Like/Unlike a post (idempotent)
export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const post = await Post.findById(id).populate("author", "name");
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        // Check if user already liked the post
        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex === -1) {
            // User hasn't liked yet, add like
            post.likes.push(userId);

            // Create notification for post author (if not liking own post)
            if (post.author._id.toString() !== userId) {
                const { createNotification } = await import("./notification.js");
                const liker = await import("../models/auth.js").then(m => m.default.findById(userId));
                await createNotification(
                    post.author._id,
                    userId,
                    "like",
                    `${liker.name} liked your post`,
                    id
                );
            }
        } else {
            // User already liked, remove like (unlike)
            post.likes.splice(likeIndex, 1);
        }

        await post.save();

        return res.status(200).json({
            success: true,
            message: likeIndex === -1 ? "Post liked" : "Post unliked",
            likes: post.likes.length,
            isLiked: likeIndex === -1,
        });
    } catch (error) {
        console.error("Error liking post:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to like/unlike post",
            error: error.message,
        });
    }
};

// Comment on a post
export const commentOnPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.userId;

        if (!text || text.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Comment text is required",
            });
        }

        const post = await Post.findById(id).populate("author", "name");
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const comment = {
            author: userId,
            text: text.trim(),
            createdAt: new Date(),
        };

        post.comments.push(comment);
        await post.save();

        // Populate the new comment's author
        await post.populate("comments.author", "name email");

        // Create notification for post author (if not commenting on own post)
        if (post.author._id.toString() !== userId) {
            const { createNotification } = await import("./notification.js");
            const commenter = await import("../models/auth.js").then(m => m.default.findById(userId));
            await createNotification(
                post.author._id,
                userId,
                "comment",
                `${commenter.name} commented on your post`,
                id
            );
        }

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment: post.comments[post.comments.length - 1],
        });
    } catch (error) {
        console.error("Error commenting on post:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add comment",
            error: error.message,
        });
    }
};

// Share a post (increment share count based on friends shared with)
export const sharePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { friendIds } = req.body;
        const userId = req.userId;

        if (!friendIds || !Array.isArray(friendIds) || friendIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one friend to share with",
            });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        // Increment shares by the number of friends shared with
        post.shares += friendIds.length;
        await post.save();

        // Create notification for each friend
        const { createNotification } = await import("./notification.js");
        const sharer = await import("../models/auth.js").then(m => m.default.findById(userId));

        for (const friendId of friendIds) {
            await createNotification(
                friendId,
                userId,
                "post_share",
                `${sharer.name} shared a post with you`,
                id
            );
        }

        return res.status(200).json({
            success: true,
            message: `Post shared with ${friendIds.length} ${friendIds.length === 1 ? 'friend' : 'friends'}`,
            shares: post.shares,
        });
    } catch (error) {
        console.error("Error sharing post:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to share post",
            error: error.message,
        });
    }
};

// Get user's posting stats
export const getUserStats = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const friendCount = user.friends.length;
        let dailyLimit;

        if (friendCount === 0) {
            dailyLimit = 0;
        } else if (friendCount === 1) {
            dailyLimit = 1;
        } else if (friendCount === 2) {
            dailyLimit = 2;
        } else if (friendCount > 10) {
            dailyLimit = "unlimited";
        } else {
            dailyLimit = friendCount;
        }

        // Check if counter needs reset
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastPost = user.lastPostDate ? new Date(user.lastPostDate) : null;
        const lastPostDay = lastPost ? new Date(lastPost.setHours(0, 0, 0, 0)) : null;

        let currentCount = user.dailyPostCount;
        if (!lastPostDay || lastPostDay.getTime() !== today.getTime()) {
            currentCount = 0;
        }

        return res.status(200).json({
            success: true,
            stats: {
                friendCount,
                dailyLimit,
                postsToday: currentCount,
                canPost: friendCount > 0 && (dailyLimit === "unlimited" || currentCount < dailyLimit),
            },
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user stats",
            error: error.message,
        });
    }
};
