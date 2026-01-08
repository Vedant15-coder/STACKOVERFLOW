import express from "express";
import {
  getallusers,
  Login,
  Signup,
  updateprofile,
  verifyLoginOTP,
} from "../controller/auth.js";
import { getLoginHistory } from "../controller/loginHistory.js";

const router = express.Router();
import auth from "../middleware/auth.js";
router.post("/signup", Signup);
router.post("/login", Login);
router.post("/verify-login-otp", verifyLoginOTP);
router.get("/getalluser", getallusers);
router.get("/login-history/:userId", auth, getLoginHistory);
router.patch("/update/:id", auth, updateprofile);
export default router;
