import express from "express";
import { requestPasswordReset } from "../controller/forgotPassword.js";

const router = express.Router();

/**
 * Forgot Password Routes
 * 
 * POST /user/forgot-password - Request password reset
 * 
 * No authentication required (public endpoint)
 * Rate limited to once per 24 hours per user
 */

router.post("/forgot-password", requestPasswordReset);

export default router;
