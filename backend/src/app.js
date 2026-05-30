import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";
import { generalLimiter } from "./middleware/rateLimiter.js";
const app = express();


app.use(helmet());

app.use(
  cors({
    origin: [
      "https://perplexity-silk.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(generalLimiter);
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

export default app;
