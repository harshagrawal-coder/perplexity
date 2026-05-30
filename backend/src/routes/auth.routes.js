import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  getUser,
  logout,
} from "../controller/auth.controller.js";
import { validateRegisterUser, validateLoginUser } from "../validators/user.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authLimiter, registerLimiter } from "../middleware/rateLimiter.js";

const authRouter = Router();

authRouter.post("/register", registerLimiter, validateRegisterUser, register);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/login", authLimiter, validateLoginUser, login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/get-user", authMiddleware, getUser);

export default authRouter;
