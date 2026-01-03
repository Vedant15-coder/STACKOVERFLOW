import express from "express";
import { askGemini } from "../controller/gemini.js";

const router = express.Router();

router.post("/ask", askGemini);

export default router;
