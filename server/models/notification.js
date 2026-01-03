import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    type: {
        type: String,
        enum: ["friend_request", "post_share", "like", "comment"],
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Notification", notificationSchema);
