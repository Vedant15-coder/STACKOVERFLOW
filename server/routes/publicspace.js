import express from "express";
import auth from "../middleware/auth.js";
import {
    createPost,
    getAllPosts,
    likePost,
    commentOnPost,
    sharePost,
    getUserStats,
} from "../controller/publicspace.js";

const router = express.Router();

// All routes are JWT-protected
router.post("/create", auth, createPost);
router.get("/feed", auth, getAllPosts);
router.post("/like/:id", auth, likePost);
router.post("/comment/:id", auth, commentOnPost);
router.post("/share/:id", auth, sharePost);
router.get("/my-stats", auth, getUserStats);

export default router;
