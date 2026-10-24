
import { 
    sendMessage as sendMessageService,
    getMessages as getMessagesService,
} from "../services/messageService.js";


export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    const message = await sendMessageService(
      req.userId,
      conversationId,
      text
    );

    // Broadcast the saved message to the conversation room.
    const io = req.app.get("io");

    if (io) {
      io.to(`conversation:${conversationId}`).emit(
        "new_message",
        message
      );
    }

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to send message",
    });
  }
};


export const getMessages = async (req, res) => {
  try {
    const messages = await getMessagesService(
      req.userId,
      req.params.conversationId
    );

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to fetch messages",
    });
  }
};
