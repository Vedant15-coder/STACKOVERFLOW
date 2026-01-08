import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDeviceInfo } from "../utils/deviceDetection.js";
import { evaluateAccessRules, determineLoginMethod } from "../utils/conditionalAccess.js";
import { createLoginOTP, verifyLoginOTP as verifyOTPService, canRequestLoginOTP } from "../services/otpService.js";
import { sendLoginOTP } from "../utils/emailService.js";
import LoginHistory from "../models/LoginHistory.js";

export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (exisitinguser) {
      return res.status(404).json({ message: "User already exist" });
    }
    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await user.create({
      name,
      email,
      password: hashpassword,
    });

    // Extract device information for login history
    const deviceInfo = getDeviceInfo(req);

    // Create initial login history record for signup
    try {
      await LoginHistory.create({
        userId: newuser._id,
        ...deviceInfo,
        loginMethod: "Password",
        loginStatus: "Success",
        failureReason: null,
      });
    } catch (historyError) {
      console.error("Failed to create login history for signup:", historyError);
      // Don't fail the signup if login history creation fails
    }


    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );
    res.status(200).json({ data: newuser, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "something went wrong..", error: error.message });
    return;
  }
};

/**
 * Login with conditional access control
 * - Chrome Desktop/Laptop: Requires Email OTP
 * - Edge: Direct login
 * - Mobile: Time-based access (10 AM - 1 PM IST)
 */
export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Extract device information from request
    const deviceInfo = getDeviceInfo(req);

    // Find user
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      // Log failed attempt - user not found
      await LoginHistory.create({
        userId: null, // No user ID since user doesn't exist
        ...deviceInfo,
        loginMethod: "Password",
        loginStatus: "Blocked",
        failureReason: "User does not exist",
      });

      return res.status(404).json({ message: "User does not exist" });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      // Log failed attempt - wrong password
      await LoginHistory.create({
        userId: existingUser._id,
        ...deviceInfo,
        loginMethod: "Password",
        loginStatus: "Blocked",
        failureReason: "Invalid password",
      });

      return res.status(400).json({ message: "Invalid password" });
    }

    // Evaluate conditional access rules
    const accessRules = evaluateAccessRules(deviceInfo);

    // Check if access is blocked (e.g., mobile outside allowed hours)
    if (!accessRules.allowed) {
      // Log blocked attempt
      await LoginHistory.create({
        userId: existingUser._id,
        ...deviceInfo,
        loginMethod: "Password",
        loginStatus: "Blocked",
        failureReason: accessRules.reason,
      });

      return res.status(403).json({
        message: accessRules.reason,
        blocked: true
      });
    }

    // Check if OTP is required (Chrome Desktop/Laptop)
    if (accessRules.requiresOTP) {
      // Check rate limiting
      const canRequest = await canRequestLoginOTP(existingUser._id);
      if (!canRequest) {
        return res.status(429).json({
          message: "Too many OTP requests. Please try again in 15 minutes."
        });
      }

      // Generate and send OTP
      const { otp } = await createLoginOTP(existingUser._id, "email");
      await sendLoginOTP(existingUser.email, otp, deviceInfo.browser, deviceInfo.os);

      // Log OTP sent (not yet verified)
      await LoginHistory.create({
        userId: existingUser._id,
        ...deviceInfo,
        loginMethod: "Password", // Will be updated to "Email OTP" after verification
        loginStatus: "Blocked",
        failureReason: "Awaiting OTP verification",
      });

      return res.status(200).json({
        requiresOTP: true,
        userId: existingUser._id.toString(),
        email: existingUser.email,
        message: "OTP sent to your email. Please verify to continue.",
      });
    }

    // Direct login (Edge or other allowed browsers)
    const loginMethod = determineLoginMethod(deviceInfo, false);

    // Create success login history
    await LoginHistory.create({
      userId: existingUser._id,
      ...deviceInfo,
      loginMethod,
      loginStatus: "Success",
      failureReason: null,
    });

    // Generate JWT token
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({ data: existingUser, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong during login" });
    return;
  }
};

/**
 * Verify login OTP and complete authentication
 */
export const verifyLoginOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    // Extract device information
    const deviceInfo = getDeviceInfo(req);

    // Validate inputs
    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required" });
    }

    // Find user
    const existingUser = await user.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP
    const verification = await verifyOTPService(userId, otp);

    if (!verification.valid) {
      // Log failed OTP verification
      await LoginHistory.create({
        userId: existingUser._id,
        ...deviceInfo,
        loginMethod: "Email OTP",
        loginStatus: "Blocked",
        failureReason: verification.message,
      });

      return res.status(400).json({ message: verification.message });
    }

    // OTP verified successfully - create success login history
    await LoginHistory.create({
      userId: existingUser._id,
      ...deviceInfo,
      loginMethod: "Email OTP",
      loginStatus: "Success",
      failureReason: null,
    });

    // Generate JWT token
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      data: existingUser,
      token,
      message: "Login successful"
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Something went wrong during OTP verification" });
    return;
  }
};
export const getallusers = async (req, res) => {
  try {
    const alluser = await user.find();
    res.status(200).json({ data: alluser });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { name, about, tags } = req.body.editForm;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }
  try {
    const updateprofile = await user.findByIdAndUpdate(
      _id,
      { $set: { name: name, about: about, tags: tags } },
      { new: true }
    );
    res.status(200).json({ data: updateprofile });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};
