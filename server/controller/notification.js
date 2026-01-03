import Notification from "../models/notification.js";
import Post from "../models/post.js";

// Get user's notifications
export const getNotifications = async (req, res) => {
    try {
        const userId = req.userid;

        const notifications = await Notification.find({ recipient: userId })
            .populate("sender", "name email")
            .populate({
                path: "post",
                select: "caption",
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
            error: error.message,
        });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.userid;

        const count = await Notification.countDocuments({
            recipient: userId,
            read: false,
        });

        return res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch unread count",
            error: error.message,
        });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userid;

        const notification = await Notification.findOne({
            _id: id,
            recipient: userId,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        notification.read = true;
        await notification.save();

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
            error: error.message,
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userid;

        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error("Error marking all as read:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark all as read",
            error: error.message,
        });
    }
};

// Helper function to create notification
export const createNotification = async (recipientId, senderId, type, message, postId = null) => {
    try {
        const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            type,
            message,
            post: postId,
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};
