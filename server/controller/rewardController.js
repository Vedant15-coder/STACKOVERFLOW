import mongoose from "mongoose";
import User from "../models/auth.js";
import Question from "../models/question.js";
import PointTransaction from "../models/pointTransaction.js";

/**
 * Award +5 points when a user posts an answer
 */
export const awardPointsForAnswer = async (userId, answerId, questionId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }

        // Update user points
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { points: 5 } },
            { new: true }
        );

        if (!user) {
            throw new Error("User not found");
        }

        // Log transaction
        await PointTransaction.create({
            fromUser: null, // system reward
            toUser: userId,
            points: 5,
            reason: "answer_posted",
            relatedAnswer: answerId,
            relatedQuestion: questionId,
        });

        return { success: true, newBalance: user.points };
    } catch (error) {
        console.error("Error awarding points for answer:", error);
        throw error;
    }
};

/**
 * Award +5 points when answer reaches 5 net upvotes (only once)
 */
export const checkAndAwardUpvoteMilestone = async (questionId, answerId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            throw new Error("Invalid question ID");
        }
        if (!mongoose.Types.ObjectId.isValid(answerId)) {
            throw new Error("Invalid answer ID");
        }

        // Find the question and specific answer
        const questionDoc = await Question.findById(questionId);
        if (!questionDoc) {
            throw new Error("Question not found");
        }

        const answer = questionDoc.answer.id(answerId);
        if (!answer) {
            throw new Error("Answer not found");
        }

        // Check if reward already given
        if (answer.upvoteRewardGiven) {
            return { success: false, message: "Milestone reward already awarded" };
        }

        // Calculate net upvotes
        const netUpvotes = answer.upvotes.length - answer.downvotes.length;

        // Award bonus if threshold reached
        if (netUpvotes >= 5) {
            const userId = answer.userid;

            // Update user points
            const user = await User.findByIdAndUpdate(
                userId,
                { $inc: { points: 5 } },
                { new: true }
            );

            if (!user) {
                throw new Error("User not found");
            }

            // Set flag to prevent duplicate rewards
            answer.upvoteRewardGiven = true;
            await questionDoc.save();

            // Log transaction
            await PointTransaction.create({
                fromUser: null, // system reward
                toUser: userId,
                points: 5,
                reason: "upvote_milestone",
                relatedAnswer: answerId,
                relatedQuestion: questionId,
            });

            return { success: true, newBalance: user.points, awarded: true };
        }

        return { success: true, awarded: false };
    } catch (error) {
        console.error("Error checking upvote milestone:", error);
        throw error;
    }
};

/**
 * Revoke +5 milestone bonus when net upvotes fall below 5
 */
export const revokeUpvoteMilestone = async (questionId, answerId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            throw new Error("Invalid question ID");
        }
        if (!mongoose.Types.ObjectId.isValid(answerId)) {
            throw new Error("Invalid answer ID");
        }

        // Find the question and specific answer
        const questionDoc = await Question.findById(questionId);
        if (!questionDoc) {
            throw new Error("Question not found");
        }

        const answer = questionDoc.answer.id(answerId);
        if (!answer) {
            throw new Error("Answer not found");
        }

        // Only revoke if reward was previously given
        if (!answer.upvoteRewardGiven) {
            return { success: false, message: "No milestone reward to revoke" };
        }

        // Calculate net upvotes
        const netUpvotes = answer.upvotes.length - answer.downvotes.length;

        // Revoke bonus if below threshold
        if (netUpvotes < 5) {
            const userId = answer.userid;

            // Deduct points (prevent negative balance)
            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            const deductAmount = Math.min(5, user.points); // Don't go negative
            user.points -= deductAmount;
            await user.save();

            // Reset flag
            answer.upvoteRewardGiven = false;
            await questionDoc.save();

            // Log transaction
            await PointTransaction.create({
                fromUser: null, // system action
                toUser: userId,
                points: -deductAmount,
                reason: "upvote_milestone_revoked",
                relatedAnswer: answerId,
                relatedQuestion: questionId,
            });

            return { success: true, newBalance: user.points, revoked: true };
        }

        return { success: true, revoked: false };
    } catch (error) {
        console.error("Error revoking upvote milestone:", error);
        throw error;
    }
};

/**
 * Deduct all points awarded for a deleted answer
 */
export const deductPointsOnAnswerRemoval = async (userId, answerId, questionId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }
        if (!mongoose.Types.ObjectId.isValid(answerId)) {
            throw new Error("Invalid answer ID");
        }

        // Find the answer to check if milestone bonus was given
        const questionDoc = await Question.findById(questionId).session(session);
        if (!questionDoc) {
            throw new Error("Question not found");
        }

        const answer = questionDoc.answer.id(answerId);
        if (!answer) {
            throw new Error("Answer not found");
        }

        // Calculate total points to deduct
        let totalDeduction = 5; // Base answer reward
        if (answer.upvoteRewardGiven) {
            totalDeduction += 5; // Milestone bonus
        }

        // Get user and prevent negative balance
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error("User not found");
        }

        const actualDeduction = Math.min(totalDeduction, user.points);
        user.points -= actualDeduction;
        await user.save({ session });

        // Log transaction
        await PointTransaction.create(
            [
                {
                    fromUser: null, // system action
                    toUser: userId,
                    points: -actualDeduction,
                    reason: "answer_deleted",
                    relatedAnswer: answerId,
                    relatedQuestion: questionId,
                },
            ],
            { session, ordered: true }
        );

        await session.commitTransaction();
        return { success: true, newBalance: user.points, deducted: actualDeduction };
    } catch (error) {
        await session.abortTransaction();
        console.error("Error deducting points on answer removal:", error);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Transfer points from one user to another
 */
export const transferPoints = async (fromUserId, toUserId, amount) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validation
        if (!mongoose.Types.ObjectId.isValid(fromUserId)) {
            throw new Error("Invalid sender user ID");
        }
        if (!mongoose.Types.ObjectId.isValid(toUserId)) {
            throw new Error("Invalid recipient user ID");
        }
        if (fromUserId === toUserId) {
            throw new Error("Cannot transfer to yourself");
        }
        if (amount < 1) {
            throw new Error("Minimum transfer amount is 1 point");
        }

        // Get both users
        const fromUser = await User.findById(fromUserId).session(session);
        const toUser = await User.findById(toUserId).session(session);

        if (!fromUser) {
            throw new Error("Sender not found");
        }
        if (!toUser) {
            throw new Error("Recipient not found");
        }

        // Check sender has enough points and meets minimum threshold
        if (fromUser.points <= 10) {
            throw new Error("Minimum 10 points required to transfer");
        }
        if (fromUser.points < amount) {
            throw new Error("Insufficient balance");
        }

        // Perform transfer
        fromUser.points -= amount;
        toUser.points += amount;

        await fromUser.save({ session });
        await toUser.save({ session });

        // Log transactions for both users
        await PointTransaction.create(
            [
                {
                    fromUser: fromUserId,
                    toUser: toUserId,
                    points: -amount,
                    reason: "transfer_sent",
                },
                {
                    fromUser: fromUserId,
                    toUser: toUserId,
                    points: amount,
                    reason: "transfer_received",
                },
            ],
            { session, ordered: true }
        );

        await session.commitTransaction();
        return {
            success: true,
            senderBalance: fromUser.points,
            recipientBalance: toUser.points,
        };
    } catch (error) {
        await session.abortTransaction();
        console.error("Error transferring points:", error);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Get user's current point balance
 */
export const getUserPoints = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }

        const user = await User.findById(userId).select("points name");
        if (!user) {
            throw new Error("User not found");
        }

        return { success: true, points: user.points, name: user.name };
    } catch (error) {
        console.error("Error getting user points:", error);
        throw error;
    }
};

/**
 * Get user's transaction history
 */
export const getTransactionHistory = async (userId, limit = 50) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }

        const transactions = await PointTransaction.find({ toUser: userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("fromUser", "name")
            .populate("toUser", "name");

        return { success: true, transactions };
    } catch (error) {
        console.error("Error getting transaction history:", error);
        throw error;
    }
};
