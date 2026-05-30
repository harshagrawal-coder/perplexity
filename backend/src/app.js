import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";
import { generalLimiter } from "./middleware/rateLimiter.js";
const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://perplexity-silk.vercel.app/",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(helmet());
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(generalLimiter);
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

export default app;
