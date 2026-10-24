
import { createOrGetConversation } from "../services/conversationService.js";

export const createConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Recipient user ID is required",
      });
    }

    const conversation = await createOrGetConversation(
      req.userId,
      userId
    );

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to create conversation",
    });
  }
};
