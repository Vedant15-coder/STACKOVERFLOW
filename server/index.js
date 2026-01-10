import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js"
import questionroute from "./routes/question.js"
import answerroutes from "./routes/answer.js"
import geminiroutes from "./routes/gemini.js"
import airoutes from "./routes/ai.js"
import publicspaceroutes from "./routes/publicspace.js"
import friendroutes from "./routes/friend.js"
import notificationroutes from "./routes/notification.js"
import forgotPasswordRoutes from "./routes/forgotPassword.js"
import subscriptionRoutes from "./routes/subscription.js"
import rewardRoutes from "./routes/reward.js"
import languageRoutes from "./routes/language.js"
const app = express();
dotenv.config();
console.log("HF KEY LOADED:", !!process.env.HF_API_KEY);
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.get("/", (req, res) => {
  res.send("Stackoverflow clone is running perfect");
});

app.use('/user', userroutes)
app.use('/user', forgotPasswordRoutes)
app.use('/question', questionroute)
app.use('/answer', answerroutes)
app.use('/gemini', geminiroutes)
app.use('/ai', airoutes)
app.use('/public', publicspaceroutes)
app.use('/friend', friendroutes)
app.use('/notification', notificationroutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/rewards', rewardRoutes)
app.use('/api/language', languageRoutes)

const PORT = process.env.PORT || 5000;
const databaseurl = process.env.MONGODB_URL;

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

// Connect to MongoDB FIRST, then start server
mongoose
  .connect(databaseurl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Start server AFTER MongoDB is connected
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      name: err.name
    });
    process.exit(1); // Exit if can't connect to database
  });


