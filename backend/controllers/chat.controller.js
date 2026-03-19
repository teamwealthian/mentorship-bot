const { generateSalesReply } = require("../services/chat.service");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const validateHistory = (history) => {
  if (history === undefined) {
    return [];
  }

  if (!Array.isArray(history)) {
    throw new AppError("`history` must be an array.", 400);
  }

  return history.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new AppError(`history[${index}] must be an object.`, 400);
    }

    const { role, content } = item;

    if (!["user", "assistant", "system"].includes(role)) {
      throw new AppError(
        `history[${index}].role must be one of: user, assistant, system.`,
        400
      );
    }

    if (typeof content !== "string" || !content.trim()) {
      throw new AppError(`history[${index}].content must be a non-empty string.`, 400);
    }

    return {
      role,
      content: content.trim()
    };
  });
};

const postChat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    throw new AppError("`message` is required and must be a non-empty string.", 400);
  }

  const normalizedHistory = validateHistory(history);
  const result = await generateSalesReply({
    message,
    history: normalizedHistory
  });

  res.status(200).json({
    success: true,
    data: {
      userMessage: message.trim(),
      assistantMessage: result.reply,
      assistantMessages: result.replyMessages,
      usage: result.usage
    }
  });
});

module.exports = {
  postChat
};
