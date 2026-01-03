import express from "express";
import auth from "../middleware/auth.js";
import {
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends,
} from "../controller/friend.js";

const router = express.Router();

// All routes are JWT-protected
router.get("/search", auth, searchUsers);
router.post("/request/:userId", auth, sendFriendRequest);
router.post("/accept/:userId", auth, acceptFriendRequest);
router.post("/reject/:userId", auth, rejectFriendRequest);
router.get("/list", auth, getFriends);

export default router;
