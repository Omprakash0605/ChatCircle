
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Conversation from "../models/conversation.js";


export const initializeSocket = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Authenticate every socket connection
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";

      const token = cookieHeader
        .split(";")
        .map((item) => item.trim())
        .find((item) => item.startsWith("token="))
        ?.slice("token=".length);

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // Each user gets a private room
    socket.join(`user:${socket.userId}`);

    console.log(`User connected: ${socket.userId}`);

    
    socket.on("join_conversation", async (conversationId, callback) => {
      try {
        
        if (!/^[a-f\d]{24}$/i.test(conversationId || "")) {
          return callback?.({ success: false, message: "Invalid conversation ID" });
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.userId,
        });

        if (!conversation) {
          return callback?.({ success: false, message: "Conversation not found or access denied" });
        }

        socket.join(`conversation:${conversationId}`);

        callback?.({ success: true });
      } catch (error) {
        console.error("Join conversation error:", error.message);
        callback?.({ success: false, message: "Unable to join conversation" });
      }
    });


    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  app.set("io", io);

  return io;
};
