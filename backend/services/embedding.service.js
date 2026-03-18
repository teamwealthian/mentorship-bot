const OpenAI = require("openai");

const AppError = require("../utils/appError");

let openaiClient;

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new AppError(
      "OPENAI_API_KEY is missing. Add it to your backend .env file before using embeddings.",
      500
    );
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return openaiClient;
};

const createEmbedding = async (input) => {
  const normalizedInput = typeof input === "string" ? input.trim() : "";

  if (!normalizedInput) {
    throw new AppError("Embedding input must be a non-empty string.", 400);
  }

  const client = getOpenAIClient();
  const model = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large";
  const response = await client.embeddings.create({
    model,
    input: normalizedInput
  });

  const embedding = response.data?.[0]?.embedding;

  if (!embedding) {
    throw new AppError("OpenAI embeddings API returned an empty embedding.", 502);
  }

  return {
    embedding,
    model,
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0
    }
  };
};

module.exports = {
  createEmbedding,
  getOpenAIClient
};
