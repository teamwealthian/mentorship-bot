const AppError = require("../utils/appError");
const { getOpenAIClient } = require("./embedding.service");
const { retrieveKnowledgeContext } = require("./rag.service");
const { analyzeSalesContext } = require("./salesStrategy.service");

const MAX_ASSISTANT_MESSAGES = 3;
const MAX_WORDS_PER_MESSAGE = 15;

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
- Use simple everyday words
- Sound like a real chat agent, not a brochure

Rules:
- Always prioritize provided context over generic assumptions
- If the user has an objection, resolve it with empathy, logic, and proof
- If the user shows buying intent, guide them to a clear CTA
- If context is missing, say so briefly and ask a clarifying question
- Never fabricate pricing, performance, testimonials, guarantees, or course details
- Never promise profits or risk-free trading outcomes
- Keep responses concise, helpful, and conversion-focused
- Return 1 to 3 short chat messages only
- Each message must be at most 15 words
- Do not write long paragraphs
- Do not use bullets, numbering, markdown, or labels
- If more detail is needed, summarize briefly and ask one short next-step question

Output format:
Return valid JSON only in this shape:
{"messages":["short message 1","short message 2"]}`;

const normalizeMessageText = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .replace(/^[-*•\d.)\s]+/, "")
    .trim();

const splitIntoWordChunks = (text, maxWords = MAX_WORDS_PER_MESSAGE) => {
  const words = normalizeMessageText(text).split(" ").filter(Boolean);

  if (words.length === 0) {
    return [];
  }

  const chunks = [];

  for (let index = 0; index < words.length; index += maxWords) {
    chunks.push(words.slice(index, index + maxWords).join(" "));
  }

  return chunks;
};

const sanitizeAssistantMessages = (rawMessages) => {
  const inputMessages = Array.isArray(rawMessages) ? rawMessages : [rawMessages];
  const normalizedMessages = inputMessages
    .flatMap((item) => splitIntoWordChunks(item))
    .map((item) => normalizeMessageText(item))
    .filter(Boolean);

  return normalizedMessages.slice(0, MAX_ASSISTANT_MESSAGES);
};

const parseAssistantMessages = (content) => {
  const normalizedContent = String(content || "").trim();

  if (!normalizedContent) {
    return [];
  }

  try {
    const parsed = JSON.parse(normalizedContent);
    return sanitizeAssistantMessages(parsed.messages);
  } catch (_error) {
    return sanitizeAssistantMessages(normalizedContent);
  }
};

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
- If the user prefers Hindi or Hinglish, adapt naturally without overdoing slang
- Keep every message short and conversational
- Prefer 1 message for simple replies, 2 for moderate replies, 3 only when really needed
- Each message must stay within 15 words`
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
    response_format: {
      type: "json_object"
    },
    temperature: 0.45
  });

  const assistantMessages = parseAssistantMessages(
    completion.choices?.[0]?.message?.content?.trim()
  );

  if (assistantMessages.length === 0) {
    throw new AppError("OpenAI returned an empty response.", 502);
  }

  return {
    reply: assistantMessages.join(" "),
    replyMessages: assistantMessages,
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
