import express from "express";
import verifyToken from "../middleware/auth.js";
import {
    requestLanguageChange,
    verifyOTPAndUpdateLanguage,
    getCurrentLanguage,
} from "../controller/languageController.js";

const router = express.Router();

// All language routes require authentication
router.post("/request-otp", verifyToken, requestLanguageChange);
router.post("/verify-otp", verifyToken, verifyOTPAndUpdateLanguage);
router.get("/current", verifyToken, getCurrentLanguage);

export default router;
