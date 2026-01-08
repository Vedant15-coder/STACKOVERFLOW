import LoginHistory from "../models/LoginHistory.js";
import { maskIPAddress } from "../utils/deviceDetection.js";

/**
 * Get login history for a specific user (paginated)
 * @route GET /api/login-history/:userId
 */
export const getLoginHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Verify user is requesting their own history (from auth middleware)
        // Convert both to strings for comparison, with null/undefined checks
        const requestUserId = req.userId ? req.userId.toString() : null;
        const targetUserId = userId ? userId.toString() : null;

        if (!requestUserId || requestUserId !== targetUserId) {
            return res.status(403).json({
                message: "You can only view your own login history"
            });
        }

        // Get total count for pagination
        const total = await LoginHistory.countDocuments({ userId });

        // Get paginated login history
        const history = await LoginHistory.find({ userId })
            .sort({ createdAt: -1 }) // Latest first
            .skip(skip)
            .limit(limit)
            .lean();

        // Mask IP addresses for privacy
        const maskedHistory = history.map(entry => ({
            ...entry,
            ipAddress: maskIPAddress(entry.ipAddress),
        }));

        res.status(200).json({
            success: true,
            data: maskedHistory,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching login history:", error);
        res.status(500).json({
            message: "Failed to fetch login history"
        });
    }
};
