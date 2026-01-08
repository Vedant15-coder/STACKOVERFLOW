import User from "../models/auth.js";

// Search users by name (excluding current user and existing friends)
// If no query provided, return all available users
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.userId;

        // Get current user to check existing friends
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Ensure friends is an array
        const friendIds = currentUser.friends || [];

        // Build search filter
        const searchFilter = {
            _id: {
                $ne: userId, // Not current user
                $nin: friendIds // Not already friends
            },
        };

        // Add name filter if query is provided
        if (query && query.trim() !== "") {
            searchFilter.name = { $regex: query, $options: "i" };
        }

        // Search for users
        const users = await User.find(searchFilter)
            .select("name email joinDate")
            .limit(20); // Increased limit to show more users

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("Error searching users:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to search users",
            error: error.message,
        });
    }
};

// Send friend request (creates notification)
export const sendFriendRequest = async (req, res) => {
    try {
        const { userId: friendId } = req.params;
        const userId = req.userId;

        if (userId === friendId) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a friend request to yourself",
            });
        }

        const currentUser = await User.findById(userId);
        const friendUser = await User.findById(friendId);

        if (!currentUser || !friendUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if already friends
        if (currentUser.friends.includes(friendId)) {
            return res.status(400).json({
                success: false,
                message: "Already friends with this user",
            });
        }

        // Check if request already sent
        if (friendUser.friendRequests && friendUser.friendRequests.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "Friend request already sent",
            });
        }

        // Add friend request
        if (!friendUser.friendRequests) {
            friendUser.friendRequests = [];
        }
        friendUser.friendRequests.push(userId);
        await friendUser.save();

        // Create notification
        const { createNotification } = await import("./notification.js");
        await createNotification(
            friendId,
            userId,
            "friend_request",
            `${currentUser.name} sent you a friend request`
        );

        return res.status(200).json({
            success: true,
            message: `Friend request sent to ${friendUser.name}`,
        });
    } catch (error) {
        console.error("Error sending friend request:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send friend request",
            error: error.message,
        });
    }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
    try {
        const { userId: senderId } = req.params;
        const userId = req.userId;

        const currentUser = await User.findById(userId);
        const senderUser = await User.findById(senderId);

        if (!currentUser || !senderUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if friend request exists
        if (!currentUser.friendRequests || !currentUser.friendRequests.includes(senderId)) {
            return res.status(400).json({
                success: false,
                message: "No friend request from this user",
            });
        }

        // Remove from friend requests
        currentUser.friendRequests = currentUser.friendRequests.filter(
            id => id.toString() !== senderId
        );

        // Add to friends (mutual)
        currentUser.friends.push(senderId);
        senderUser.friends.push(userId);

        await currentUser.save();
        await senderUser.save();

        // Mark the original friend request notification as read
        const Notification = (await import("../models/notification.js")).default;
        await Notification.updateMany(
            {
                recipient: userId,
                sender: senderId,
                type: "friend_request",
                read: false
            },
            {
                $set: { read: true }
            }
        );

        // Create notification for sender
        const { createNotification } = await import("./notification.js");
        await createNotification(
            senderId,
            userId,
            "friend_request",
            `${currentUser.name} accepted your friend request`
        );

        return res.status(200).json({
            success: true,
            message: `You are now friends with ${senderUser.name}`,
            friendCount: currentUser.friends.length,
        });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to accept friend request",
            error: error.message,
        });
    }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
    try {
        const { userId: senderId } = req.params;
        const userId = req.userId;

        const currentUser = await User.findById(userId);

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if friend request exists
        if (!currentUser.friendRequests || !currentUser.friendRequests.includes(senderId)) {
            return res.status(400).json({
                success: false,
                message: "No friend request from this user",
            });
        }

        // Remove from friend requests
        currentUser.friendRequests = currentUser.friendRequests.filter(
            id => id.toString() !== senderId
        );

        await currentUser.save();

        // Mark the friend request notification as read
        const Notification = (await import("../models/notification.js")).default;
        await Notification.updateMany(
            {
                recipient: userId,
                sender: senderId,
                type: "friend_request",
                read: false
            },
            {
                $set: { read: true }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Friend request rejected",
        });
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject friend request",
            error: error.message,
        });
    }
};

// Get user's friends list
export const getFriends = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId)
            .populate("friends", "name email joinDate");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            friends: user.friends,
            count: user.friends.length,
        });
    } catch (error) {
        console.error("Error fetching friends:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch friends",
            error: error.message,
        });
    }
};
