import express from "express";
import auth from "../middleware/auth.js";
import {
    getUserPoints,
    transferPoints,
    getTransactionHistory,
} from "../controller/rewardController.js";

const router = express.Router();

/**
 * Get current user's points
 */
router.get("/my-points", auth, async (req, res) => {
    try {
        const result = await getUserPoints(req.userid);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get specific user's points (public)
 */
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await getUserPoints(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

/**
 * Transfer points to another user
 */
router.post("/transfer", auth, async (req, res) => {
    try {
        const { toUserId, amount } = req.body;
        const fromUserId = req.userid;

        if (!toUserId || !amount) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await transferPoints(fromUserId, toUserId, amount);
        res.status(200).json(result);
    } catch (error) {
        // Handle specific error types
        if (
            error.message.includes("Minimum 10 points") ||
            error.message.includes("Insufficient balance")
        ) {
            return res.status(403).json({ message: error.message });
        }
        if (error.message.includes("Cannot transfer to yourself")) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get current user's transaction history
 */
router.get("/transactions", auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const result = await getTransactionHistory(req.userid, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get specific user's transaction history (public)
 */
router.get("/transactions/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const result = await getTransactionHistory(userId, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

export default router;
