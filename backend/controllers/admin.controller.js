const { KNOWLEDGE_TYPES, createKnowledgeDraft } = require("../services/admin.service");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const addKnowledge = asyncHandler(async (req, res) => {
  const { type, content } = req.body;

  if (typeof type !== "string" || !type.trim()) {
    throw new AppError("`type` is required and must be a non-empty string.", 400);
  }

  if (!KNOWLEDGE_TYPES.includes(type.trim().toLowerCase())) {
    throw new AppError(
      `\`type\` must be one of: ${KNOWLEDGE_TYPES.join(", ")}.`,
      400
    );
  }

  if (typeof content !== "string" || !content.trim()) {
    throw new AppError("`content` is required and must be a non-empty string.", 400);
  }

  const knowledgeDraft = createKnowledgeDraft({
    type,
    content
  });

  res.status(201).json({
    success: true,
    message:
      "Knowledge draft received. In Step 8, this endpoint will save to MongoDB and upsert into Pinecone.",
    data: knowledgeDraft
  });
});

module.exports = {
  addKnowledge
};
