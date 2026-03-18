const { KNOWLEDGE_TYPES } = require("../utils/knowledgeTypes");

const createKnowledgeDraft = ({ type, content }) => {
  const normalizedType = type.trim().toLowerCase();
  const normalizedContent = content.trim();

  return {
    id: `draft_${Date.now()}`,
    type: normalizedType,
    content: normalizedContent,
    createdAt: new Date().toISOString(),
    status: "draft_received"
  };
};

module.exports = {
  KNOWLEDGE_TYPES,
  createKnowledgeDraft
};
