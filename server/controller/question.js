import mongoose from "mongoose";
import question from "../models/question.js";
import User from "../models/auth.js";
import {
  canPostQuestion,
  incrementQuestionCount,
} from "../utils/subscriptionUtils.js";

export const Askquestion = async (req, res) => {
  const { postquestiondata } = req.body;

  try {
    // NEW: Check subscription limits before posting
    const userId = postquestiondata.userid;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required to post a question."
      });
    }

    // Get user and check if they can post
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    // Check subscription limits
    const limitCheck = await canPostQuestion(user);
    if (!limitCheck.allowed) {
      return res.status(403).json({
        message: limitCheck.message,
        subscription: {
          currentPlan: limitCheck.plan || user.subscription?.plan || "FREE",
          questionsToday: limitCheck.currentCount || 0,
          limit: limitCheck.limit,
        },
        limitReached: true,
      });
    }

    // Existing logic (unchanged)
    const postques = new question({ ...postquestiondata });
    await postques.save();

    // NEW: Increment question count after successful post
    await incrementQuestionCount(userId);

    res.status(200).json({ data: postques });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const getallquestion = async (req, res) => {
  try {
    const allquestion = await question.find().sort({ askedon: -1 });
    res.status(200).json({ data: allquestion });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const deletequestion = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    await question.findByIdAndDelete(_id);
    res.status(200).json({ message: "question deleted" });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const votequestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value, userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    const questionDoc = await question.findById(_id);
    const upindex = questionDoc.upvote.findIndex((id) => id === String(userid));
    const downindex = questionDoc.downvote.findIndex(
      (id) => id === String(userid)
    );
    if (value === "upvote") {
      if (downindex !== -1) {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid)
        );
      }
      if (upindex === -1) {
        questionDoc.upvote.push(userid);
      } else {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== String(userid));
      }
    } else if (value === "downvote") {
      if (upindex !== -1) {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== String(userid));
      }
      if (downindex === -1) {
        questionDoc.downvote.push(userid);
      } else {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid)
        );
      }
    }
    const questionvote = await question.findByIdAndUpdate(_id, questionDoc, { new: true });
    res.status(200).json({ data: questionvote });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
