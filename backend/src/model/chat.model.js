import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      default: "new chat",
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

chatSchema.index({ user: 1, updatedAt: -1 });
chatSchema.index({ user: 1, lastMessageAt: -1 });

const chatmodel = mongoose.model("chat", chatSchema);

export default chatmodel;
