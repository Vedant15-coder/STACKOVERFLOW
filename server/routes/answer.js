import express from "express";
import { Askanswer, deleteanswer } from "../controller/answer.js";
import { voteAnswer } from "../controller/answerVoting.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/postanswer/:id", auth, Askanswer);
router.delete("/delete/:id", auth, deleteanswer);
router.patch("/vote/:questionId/:answerId", auth, voteAnswer);



export default router;
