import axios from "axios";
import { API_BASE_URL } from "../../../config";

const api = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  withCredentials: true,
});

function getErrorMessage(error) {
  return error.response?.data?.message || "Something went wrong";
}

export const authService = {
  async register({ email, username, password }) {
    try {
      const response = await api.post("/register", { email, username, password });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async login({ email, password }) {
    try {
      const response = await api.post("/login", { email, password });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async resendVerificationEmail(email) {
    try {
      const response = await api.post("/resend-verification-email", { email });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getUser() {
    try {
      const response = await api.get("/get-user");
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return null;
      }
      throw new Error(getErrorMessage(error));
    }
  },

  async logout() {
    try {
      const response = await api.post("/logout");
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
