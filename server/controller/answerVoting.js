import mongoose from "mongoose";
import Question from "../models/question.js";
import {
    checkAndAwardUpvoteMilestone,
    revokeUpvoteMilestone,
} from "./rewardController.js";

/**
 * Vote on an answer (upvote or downvote)
 */
export const voteAnswer = async (req, res) => {
    const { questionId, answerId } = req.params;
    const { value, userid } = req.body;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(answerId)) {
        return res.status(400).json({ message: "Invalid answer ID" });
    }

    try {
        // Find the question and answer
        const questionDoc = await Question.findById(questionId);
        if (!questionDoc) {
            return res.status(404).json({ message: "Question not found" });
        }

        const answer = questionDoc.answer.id(answerId);
        if (!answer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        // Get current vote state
        const upvoteIndex = answer.upvotes.findIndex((id) => id === String(userid));
        const downvoteIndex = answer.downvotes.findIndex((id) => id === String(userid));

        // Calculate net upvotes before change
        const netUpvotesBefore = answer.upvotes.length - answer.downvotes.length;

        if (value === "upvote") {
            // Remove from downvotes if present
            if (downvoteIndex !== -1) {
                answer.downvotes = answer.downvotes.filter((id) => id !== String(userid));
            }
            // Toggle upvote
            if (upvoteIndex === -1) {
                answer.upvotes.push(userid);
            } else {
                answer.upvotes = answer.upvotes.filter((id) => id !== String(userid));
            }
        } else if (value === "downvote") {
            // Remove from upvotes if present
            if (upvoteIndex !== -1) {
                answer.upvotes = answer.upvotes.filter((id) => id !== String(userid));
            }
            // Toggle downvote
            if (downvoteIndex === -1) {
                answer.downvotes.push(userid);
            } else {
                answer.downvotes = answer.downvotes.filter((id) => id !== String(userid));
            }
        }

        // Calculate net upvotes after change
        const netUpvotesAfter = answer.upvotes.length - answer.downvotes.length;

        // Save the question with updated votes
        await questionDoc.save();

        // Check for milestone rewards
        // Award milestone if crossing threshold upward
        if (netUpvotesBefore < 5 && netUpvotesAfter >= 5) {
            await checkAndAwardUpvoteMilestone(questionId, answerId);
        }
        // Revoke milestone if crossing threshold downward
        else if (netUpvotesBefore >= 5 && netUpvotesAfter < 5) {
            await revokeUpvoteMilestone(questionId, answerId);
        }

        res.status(200).json({
            message: "Vote recorded successfully",
            data: questionDoc,
            netUpvotes: netUpvotesAfter,
        });
    } catch (error) {
        console.error("Error voting on answer:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};
