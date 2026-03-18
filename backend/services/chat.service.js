const AppError = require("../utils/appError");
const { getOpenAIClient } = require("./embedding.service");
const { retrieveKnowledgeContext } = require("./rag.service");
const { analyzeSalesContext } = require("./salesStrategy.service");

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
- Always prioritize provided context over generic assumptions
- If the user has an objection, resolve it with empathy, logic, and proof
- If the user shows buying intent, guide them to a clear CTA
- If context is missing, say so briefly and ask a clarifying question
- Never fabricate pricing, performance, testimonials, guarantees, or course details
- Never promise profits or risk-free trading outcomes
- Keep responses concise, helpful, and conversion-focused
- Prefer 2-4 short paragraphs or bullets, not long essays`;

const buildChatMessages = ({
  message,
  history = [],
  retrievedContext = "",
  salesAnalysis
}) => {
  const recentTurns = history.slice(-10);
  const contextMessage = retrievedContext
    ? [
        {
          role: "system",
          content: `Use the following retrieved knowledge base context when making factual claims or handling objections. If the context is insufficient, be transparent and ask a clarifying question.\n\n${retrievedContext}`
        }
      ]
    : [];
  const strategyMessage = {
    role: "system",
    content: `Conversation analysis:
- Lead stage: ${salesAnalysis.leadStage}
- Preferred response language: ${salesAnalysis.languageMode}

Recent conversation summary:
${salesAnalysis.conversationSummary}

Response strategy:
${salesAnalysis.strategyNotes.map((note) => `- ${note}`).join("\n")}

Execution rules:
- Start by answering the user's actual question directly
- Use retrieved knowledge when available for factual claims
- If trust is low, add proof or reasoning from context
- If buying intent is high, end with one specific CTA
- If buying intent is low, end with one clarifying question or next step
- If the user prefers Hindi or Hinglish, adapt naturally without overdoing slang`
  };

  return [
    {
      role: "system",
      content: SALES_AGENT_SYSTEM_PROMPT
    },
    ...contextMessage,
    strategyMessage,
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
  const salesAnalysis = analyzeSalesContext({
    message,
    history,
    retrievedDocuments: retrieval.documents
  });
  const chatMessages = buildChatMessages({
    message,
    history,
    retrievedContext: retrieval.contextText,
    salesAnalysis
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
      retrieval: retrieval.usage,
      salesAnalysis: {
        leadStage: salesAnalysis.leadStage,
        languageMode: salesAnalysis.languageMode,
        strategyNotes: salesAnalysis.strategyNotes
      }
    }
  };
};

module.exports = {
  SALES_AGENT_SYSTEM_PROMPT,
  generateSalesReply
};
