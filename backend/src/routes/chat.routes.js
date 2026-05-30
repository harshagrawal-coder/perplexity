import { Router } from "express";
import {
  sendMessage,
  getAllChats,
  getChatMessages,
  deleteChat,
} from "../controller/chat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const chatRouter = Router();
chatRouter.post("/message", authMiddleware, sendMessage);
chatRouter.get("/get-all-chats", authMiddleware, getAllChats);
chatRouter.get("/get-chat/:chatId", authMiddleware, getChatMessages);
chatRouter.delete("/delete-chat/:chatId", authMiddleware, deleteChat);
export default chatRouter;
