
import mongoose from "mongoose";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

export const sendMessage = async (
  currentUserId,
  conversationId,
  text
) => {
  if (!mongoose.isValidObjectId(conversationId)) {
    const error = new Error("Invalid conversation ID");
    error.statusCode = 400;
    throw error;
  }

  if (typeof text !== "string" || !text.trim()) {
    const error = new Error("Message cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  if (text.trim().length > 5000) {
    const error = new Error("Message cannot exceed 5000 characters");
    error.statusCode = 400;
    throw error;
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: currentUserId,
  });

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: currentUserId,
    text: text.trim(),
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  return message;
};

export const getMessages = async (
  currentUserId,
  conversationId
) => {
  if (!mongoose.isValidObjectId(conversationId)) {
    const error = new Error("Invalid conversation ID");
    error.statusCode = 400;
    throw error;
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: currentUserId,
  });

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const messages = await Message.find({
    conversation: conversationId,
  })
    .sort({ createdAt: 1 })
    .limit(100)
    .populate("sender", "name avatar");

  return messages;
};
