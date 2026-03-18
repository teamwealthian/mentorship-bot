const AppError = require("../utils/appError");
const { getOpenAIClient } = require("./embedding.service");
const { retrieveKnowledgeContext } = require("./rag.service");

const SALES_AGENT_SYSTEM_PROMPT = `You are a high-converting AI sales agent for a stock market education platform.

Your goals:
- Understand user intent
- Answer questions clearly
- Handle objections persuasively
- Build trust using logic + examples + social proof
- Guide user toward conversion (buy course / book call)

Tone:
- Friendly, confident, non-pushy
- Mix Hinglish if needed (Indian audience)

Rules:
- Always use provided context
- If objection -> handle it like a sales expert
- If user shows buying intent -> push CTA
- If unsure -> ask clarifying question`;

const buildChatMessages = ({ message, history = [], retrievedContext = "" }) => {
  const recentTurns = history.slice(-10);
  const contextMessage = retrievedContext
    ? [
        {
          role: "system",
          content: `Use the following retrieved knowledge base context when making factual claims or handling objections. If the context is insufficient, be transparent and ask a clarifying question.\n\n${retrievedContext}`
        }
      ]
    : [];

  return [
    {
      role: "system",
      content: SALES_AGENT_SYSTEM_PROMPT
    },
    ...contextMessage,
    ...recentTurns,
    {
      role: "user",
      content: message.trim()
    }
  ];
};

const generateSalesReply = async ({ message, history = [] }) => {
  const client = getOpenAIClient();
  const retrieval = await retrieveKnowledgeContext(message);
  const chatMessages = buildChatMessages({
    message,
    history,
    retrievedContext: retrieval.contextText
  });
  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";

  const completion = await client.chat.completions.create({
    model,
    messages: chatMessages,
    temperature: 0.7
  });

  const assistantMessage = completion.choices?.[0]?.message?.content?.trim();

  if (!assistantMessage) {
    throw new AppError("OpenAI returned an empty response.", 502);
  }

  return {
    reply: assistantMessage,
    usage: {
      model,
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      historyMessagesUsed: history.slice(-10).length,
      retrieval: retrieval.usage
    }
  };
};

module.exports = {
  SALES_AGENT_SYSTEM_PROMPT,
  generateSalesReply
};
