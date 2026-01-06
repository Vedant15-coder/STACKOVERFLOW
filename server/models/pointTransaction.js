import mongoose from "mongoose";

const pointTransactionSchema = mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null, // null for system rewards
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    points: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
        enum: [
            "answer_posted",
            "upvote_milestone",
            "upvote_milestone_revoked",
            "answer_deleted",
            "transfer_sent",
            "transfer_received",
        ],
    },
    relatedAnswer: {
        type: mongoose.Schema.Types.ObjectId,
        default: null, // reference to answer _id within question
    },
    relatedQuestion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "question",
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for fast queries
pointTransactionSchema.index({ toUser: 1, createdAt: -1 });
pointTransactionSchema.index({ fromUser: 1, createdAt: -1 });

export default mongoose.model("PointTransaction", pointTransactionSchema);
