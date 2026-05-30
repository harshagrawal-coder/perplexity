import mongoose from "mongoose";

import {
  generateResponse,
  generateTitle,
} from "../services/ai.services.js";

import chatmodel from "../model/chat.model.js";
import messagemodel from "../model/message.model.js";

// SEND MESSAGE
export async function sendMessage(req, res) {
  try {
    const { message, chatId } = req.body;

    // VALIDATION
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (message.length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long. Maximum 10000 characters.",
      });
    }

    let chat;
    let isNewChat = false;

    // EXISTING CHAT
    if (chatId) {
      chat = await chatmodel.findOne({
        _id: chatId,
        user: req.user.id,
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }
    }

    // CREATE NEW CHAT
    else {
      isNewChat = true;

      chat = await chatmodel.create({
        user: req.user.id,

        // TEMP TITLE
        title: "New Chat",
      });
    }

    // SAVE USER MESSAGE
    await messagemodel.create({
      chat: chat._id,

      content: message.trim(),

      role: "user",
    });

    // FETCH OLD MESSAGES
    const oldMessages = await messagemodel
      .find({
        chat: chat._id,
      })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    // FORMAT CHAT HISTORY
    const formattedMessages = oldMessages
      .filter(
        (msg) =>
          msg.content &&
          typeof msg.content === "string" &&
          msg.content.trim() !== ""
      )
      .map((msg) => ({
        role: msg.role,

        content: msg.content.trim(),
      }));

    // GENERATE AI RESPONSE
    const aiResponse = await generateResponse(
      formattedMessages
    );

    // SAVE AI MESSAGE
    const assistantMessage = await messagemodel.create({
      chat: chat._id,

      content: aiResponse,

      role: "assistant",
    });

    // GENERATE BETTER TITLE
    if (isNewChat) {
      const generatedTitle = await generateTitle(
        message,
        aiResponse
      );

      chat.title = generatedTitle || "New Chat";
    }

    // UPDATE CHAT TIME
    chat.lastMessageAt = new Date();

    await chat.save();

    // RESPONSE
    return res.status(200).json({
      success: true,

      title: chat.title,

      response: aiResponse,

      chatId: chat._id,

      assistantMessage,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
}

// GET ALL CHATS
export async function getAllChats(req, res) {
  try {
    const chats = await chatmodel
      .find({
        user: req.user.id,
      })
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      success: true,

      chats,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
}

// GET CHAT MESSAGES
export async function getChatMessages(req, res) {
  try {
    const { chatId } = req.params;

    // VERIFY OWNERSHIP
    const chat = await chatmodel.findOne({
      _id: chatId,

      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,

        message: "Chat not found",
      });
    }

    // FETCH MESSAGES
    const messages = await messagemodel
      .find({
        chat: chatId,
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,

      messages,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
}

// DELETE CHAT
export async function deleteChat(req, res) {
  const session = await mongoose.startSession();

  try {
    const { chatId } = req.params;

    // VERIFY CHAT
    const chat = await chatmodel.findOne({
      _id: chatId,

      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,

        message: "Chat not found",
      });
    }

    // TRANSACTION
    session.startTransaction();

    await messagemodel
      .deleteMany({
        chat: chatId,
      })
      .session(session);

    await chatmodel
      .findByIdAndDelete(chatId)
      .session(session);

    await session.commitTransaction();

    session.endSession();

    return res.status(200).json({
      success: true,

      message: "Chat deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();

    session.endSession();

    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
}