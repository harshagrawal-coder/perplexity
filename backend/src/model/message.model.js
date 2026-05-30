import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
}, { _id: false });

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
      required: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: ["pending", "streaming", "complete", "failed"],
      default: "complete",
    },
  },
  { timestamps: true },
);

messageSchema.index({ chat: 1, createdAt: 1 });

const messagemodel = mongoose.model("message", messageSchema);

export default messagemodel;
