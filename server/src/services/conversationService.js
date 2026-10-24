
import mongoose from "mongoose";
import User from "../models/user.js";
import Conversation from "../models/conversation.js";

export const createOrGetConversation = async (currentUserId, otherUserId) => {
  if (
    !mongoose.isValidObjectId(currentUserId) ||
    !mongoose.isValidObjectId(otherUserId)
  ) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }

  if (currentUserId === otherUserId) {
    const error = new Error("You cannot chat with yourself");
    error.statusCode = 400;
    throw error;
  }

  const otherUser = await User.findById(otherUserId);

  if (!otherUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const participants = [
    new mongoose.Types.ObjectId(currentUserId),
    new mongoose.Types.ObjectId(otherUserId),
  ];

  let conversation = await Conversation.findOne({
    participants: {
      $all: participants,
      $size: 2,
    },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants,
    });
  }

  return conversation;
};
