import mongoose from "mongoose";
import question from "../models/question.js";
import { awardPointsForAnswer, deductPointsOnAnswerRemoval } from "./rewardController.js";

export const Askanswer = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  const { noofanswer, answerbody, useranswered, userid } = req.body;
  updatenoofanswer(_id, noofanswer);

  try {
    const updatequestion = await question.findByIdAndUpdate(_id, {
      $addToSet: { answer: [{ answerbody, useranswered, userid }] },
    });

    // NEW: Award +5 points for posting answer
    try {
      // Get the newly created answer ID
      const updatedQuestion = await question.findById(_id);
      const newAnswer = updatedQuestion.answer[updatedQuestion.answer.length - 1];
      await awardPointsForAnswer(userid, newAnswer._id, _id);
    } catch (rewardError) {
      console.error("Error awarding points for answer:", rewardError);
      // Don't fail the answer post if reward fails
    }

    res.status(200).json({ data: updatequestion });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};
const updatenoofanswer = async (_id, noofanswer) => {
  try {
    await question.findByIdAndUpdate(_id, { $set: { noofanswer: noofanswer } });
  } catch (error) {
    console.log(error);
  }
};
export const deleteanswer = async (req, res) => {
  const { id: _id } = req.params;
  const { noofanswer, answerid, userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  if (!mongoose.Types.ObjectId.isValid(answerid)) {
    return res.status(400).json({ message: "answer unavailable" });
  }
  updatenoofanswer(_id, noofanswer);

  // NEW: Deduct points before deleting answer
  try {
    if (userid) {
      await deductPointsOnAnswerRemoval(userid, answerid, _id);
    }
  } catch (rewardError) {
    console.error("Error deducting points on answer removal:", rewardError);
    // Don't fail the deletion if reward deduction fails
  }

  try {
    const updatequestion = await question.updateOne(
      { _id },
      {
        $pull: { answer: { _id: answerid } },
      }
    );
    res.status(200).json({ data: updatequestion });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};
