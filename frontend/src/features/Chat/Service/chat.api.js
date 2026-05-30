import axios from "axios";
import { API_BASE_URL } from "../../../config";

const api = axios.create({
  baseURL: `${API_BASE_URL}/chat`,
  withCredentials: true,
});

export const chatApi = {
  async sendMessage({ chatId, message }) {
    try {
      const response = await api.post("/message", { chatId, message });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message ||
        error.response?.data || { message: "Failed to send message" }
      );
    }
  },

  async getAllChats() {
    try {
      const response = await api.get("/get-all-chats");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message ||
        error.response?.data || { message: "Failed to fetch chats" }
      );
    }
  },

  async getChatMessages(chatId) {
    try {
      const response = await api.get(`/get-chat/${chatId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message ||
        error.response?.data || { message: "Failed to fetch chat" }
      );
    }
  },

  async deleteChat(chatId) {
    try {
      const response = await api.delete(`/delete-chat/${chatId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message ||
        error.response?.data || { message: "Failed to delete chat" }
      );
    }
  },
};
