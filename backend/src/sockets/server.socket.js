import { Server } from "socket.io";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("socket io server is running");

  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);
  });
}
export function getID() {
  if (!io) {
    throw new Error("socket.io not initialized");
  }

  return io;
}