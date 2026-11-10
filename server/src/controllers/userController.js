
import User from "../models/user.js";
import Message from "../models/message.js";
import Conversation from "../models/conversation.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.userId },
    })
      .select("name email avatar about")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, about } = req.body;

    if (name && (name.trim().length < 2 || name.trim().length > 50)) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters",
      });
    }

    if (about && about.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "About status cannot exceed 150 characters",
      });
    }

    const updateData = {};
    if (typeof name === "string") updateData.name = name.trim();
    if (typeof avatar === "string") updateData.avatar = avatar.trim();
    if (typeof about === "string") updateData.about = about.trim();

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Broadcast user update via Socket.IO so other users see new avatar & name live
    const io = req.app.get("io");
    if (io) {
      io.emit("user_profile_updated", {
        userId: user._id,
        name: user.name,
        avatar: user.avatar,
        about: user.about,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        about: user.about,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const getMediaSharingDetails = async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Total messages sent
    const totalMessages = await Message.countDocuments({
      sender: currentUserId,
    });

    // Total conversations user is part of
    const totalConversations = await Conversation.countDocuments({
      participants: currentUserId,
    });

    // Messages with mediaUrl
    const mediaMessages = await Message.find({
      sender: currentUserId,
      mediaUrl: { $exists: true, $ne: "" },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("conversation", "participants");

    // Messages with web links in text
    const linkMessages = await Message.find({
      sender: currentUserId,
      text: { $regex: /(https?:\/\/[^\s]+|www\.[^\s]+)/i },
    })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      stats: {
        totalMessages,
        totalConversations,
        mediaCount: mediaMessages.length,
        linksCount: linkMessages.length,
      },
      media: mediaMessages,
      links: linkMessages,
    });
  } catch (error) {
    console.error("Get media sharing details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch media sharing details",
    });
  }
};
