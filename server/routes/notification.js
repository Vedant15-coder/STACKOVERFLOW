import express from "express";
import auth from "../middleware/auth.js";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "../controller/notification.js";

const router = express.Router();

// All routes are JWT-protected
router.get("/list", auth, getNotifications);
router.get("/unread-count", auth, getUnreadCount);
router.put("/read/:id", auth, markAsRead);
router.put("/read-all", auth, markAllAsRead);

export default router;
