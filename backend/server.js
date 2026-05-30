import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import connectToDB from "./src/db/config.js";
import { verifyMailTransporter } from "./src/services/mail.services.js";
import { initSocket } from "./src/sockets/server.socket.js";
import http from "http";
const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);
async function startServer() {
  try {
    await connectToDB();
    const mailReady = await verifyMailTransporter();
    if (!mailReady) {
      console.warn("Mail transporter is not ready. Verification emails may fail.");
    }

    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
