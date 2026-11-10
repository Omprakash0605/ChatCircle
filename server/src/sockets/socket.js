
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Conversation from "../models/conversation.js";


// Map of userId -> Set of socketIds (supports multiple tabs/devices per user)
const userSocketMap = new Map();

export const getOnlineUserIds = () => Array.from(userSocketMap.keys());

export const getUserSocketIds = (userId) => {
  return Array.from(userSocketMap.get(String(userId)) || []);
};

export const initializeSocket = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
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

      socket.userId = String(decoded.userId);
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    // Each user gets a private room
    socket.join(`user:${userId}`);

    // Track active socket for this user
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    console.log(`User connected: ${userId} (Socket: ${socket.id})`);

    // Broadcast updated list of online user IDs to all connected clients
    io.emit("get_online_users", Array.from(userSocketMap.keys()));

    socket.on("join_conversation", async (conversationId, callback) => {
      try {
        if (!/^[a-f\d]{24}$/i.test(conversationId || "")) {
          return callback?.({ success: false, message: "Invalid conversation ID" });
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
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
      console.log(`User disconnected: ${userId} (Socket: ${socket.id})`);

      if (userSocketMap.has(userId)) {
        const sockets = userSocketMap.get(userId);
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          userSocketMap.delete(userId);
        }
      }

      // Broadcast updated online users list to all remaining connected clients
      io.emit("get_online_users", Array.from(userSocketMap.keys()));
    });
  });

  app.set("io", io);

  return io;
};
