const AppError = require("../utils/appError");
const Knowledge = require("../models/knowledge.model");
const { createEmbedding } = require("./embedding.service");
const { upsertKnowledgeVectors } = require("./vector.service");
const { KNOWLEDGE_TYPES } = require("../utils/knowledgeTypes");
const { chunkText } = require("../utils/chunkText");

const buildVectorRecord = ({ knowledgeId, type, content, chunkIndex, embedding }) => ({
  id: `${knowledgeId}_chunk_${chunkIndex}`,
  values: embedding,
  metadata: {
    knowledgeId: String(knowledgeId),
    type,
    chunkIndex,
    content
  }
});

const saveKnowledge = async ({ type, content }) => {
  if (!process.env.MONGODB_URI) {
    throw new AppError(
      "MONGODB_URI is missing. Add MongoDB configuration to enable admin knowledge saving.",
      500
    );
  }

  const normalizedType = type.trim().toLowerCase();
  const normalizedContent = content.trim();
  const knowledge = await Knowledge.create({
    type: normalizedType,
    content: normalizedContent
  });
  const chunks = chunkText(normalizedContent);
  const embeddingResults = await Promise.all(
    chunks.map((chunk) =>
      createEmbedding(`${normalizedType.toUpperCase()}\n${chunk}`)
    )
  );
  const vectorRecords = embeddingResults.map((result, index) =>
    buildVectorRecord({
      knowledgeId: knowledge._id,
      type: normalizedType,
      content: chunks[index],
      chunkIndex: index,
      embedding: result.embedding
    })
  );
  const vectorResult = await upsertKnowledgeVectors(vectorRecords);

  return {
    id: String(knowledge._id),
    type: knowledge.type,
    content: knowledge.content,
    createdAt: knowledge.createdAt,
    status: "saved",
    chunksCreated: chunks.length,
    vectorUpsert: vectorResult
  };
};

module.exports = {
  KNOWLEDGE_TYPES,
  saveKnowledge
};
