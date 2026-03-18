const { createEmbedding } = require("./embedding.service");
const { queryKnowledgeMatches } = require("./vector.service");

const getMatchContent = (metadata = {}) =>
  metadata.content || metadata.text || metadata.chunk || metadata.body || "";

const buildContextBlock = (documents) =>
  documents
    .map((document, index) => {
      const typeLabel = document.type ? `Type: ${document.type}\n` : "";

      return `Document ${index + 1}\n${typeLabel}${document.content}`;
    })
    .join("\n\n---\n\n");

const retrieveKnowledgeContext = async (message) => {
  const topK = Number(process.env.RAG_TOP_K || 5);
  const minScore = Number(process.env.RAG_SCORE_THRESHOLD || 0.2);
  const { embedding, model: embeddingModel, usage: embeddingUsage } =
    await createEmbedding(message);
  let enabled = false;
  let matches = [];
  let retrievalError = "";

  try {
    const queryResult = await queryKnowledgeMatches({
      embedding,
      topK,
      minScore
    });

    enabled = queryResult.enabled;
    matches = queryResult.matches;
  } catch (error) {
    retrievalError = error.message || "Vector retrieval failed.";
  }

  const documents = matches
    .map((match) => {
      const metadata = match.metadata || {};
      const content = getMatchContent(metadata).trim();

      if (!content) {
        return null;
      }

      return {
        id: match.id,
        score: match.score || 0,
        type: metadata.type || "general",
        content
      };
    })
    .filter(Boolean);

  return {
    contextText: documents.length > 0 ? buildContextBlock(documents) : "",
    documents,
    usage: {
      enabled,
      topK,
      minScore,
      embeddingModel,
      embeddingTokens: embeddingUsage.totalTokens,
      retrievedDocuments: documents.length,
      error: retrievalError
    }
  };
};

module.exports = {
  retrieveKnowledgeContext
};
