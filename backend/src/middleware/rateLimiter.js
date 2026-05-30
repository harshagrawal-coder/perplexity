import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many attempts. Please try again after 15 minutes.",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many registration attempts. Please try again after an hour.",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests. Please try again later.",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
