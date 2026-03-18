const { Pinecone } = require("@pinecone-database/pinecone");

let pineconeClient;

const hasVectorConfig = () =>
  Boolean(process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME);

const getPineconeIndex = () => {
  if (!hasVectorConfig()) {
    return null;
  }

  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
  }

  const index = pineconeClient.index(process.env.PINECONE_INDEX_NAME);
  const namespace = process.env.PINECONE_NAMESPACE;

  return namespace ? index.namespace(namespace) : index;
};

const queryKnowledgeMatches = async ({ embedding, topK, minScore }) => {
  const index = getPineconeIndex();

  if (!index) {
    return {
      enabled: false,
      matches: []
    };
  }

  const response = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true
  });

  const matches = (response.matches || []).filter(
    (match) => typeof match.score !== "number" || match.score >= minScore
  );

  return {
    enabled: true,
    matches
  };
};

module.exports = {
  hasVectorConfig,
  queryKnowledgeMatches
};
