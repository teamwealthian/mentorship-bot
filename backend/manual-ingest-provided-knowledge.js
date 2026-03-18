require("dotenv").config();

const mongoose = require("mongoose");
const { Pinecone } = require("@pinecone-database/pinecone");

const Knowledge = require("./models/knowledge.model");

const KNOWLEDGE_ITEMS = [
  {
    chunkId: "PROD-01",
    type: "product",
    knowledgeType: "product_knowledge",
    language: "english",
    stage: "awareness",
    topicTags: ["program_overview", "price", "mentor", "mentorship"],
    content: `Product: Six-Month Mentorship on Options Trading
Mentor: Kundan Kishore
Price: Rs 35,000 (one-time payment)
Tagline: Your One-on-One Personalised Mentorship

This is a structured 6-month mentorship program designed to help individuals become confident, disciplined, and profitable options traders. It combines concept-based learning, practical training (without risk), and personalized mentorship. The focus is on logic-driven, market-neutral trading, not tips or predictions.`
  },
  {
    chunkId: "PROD-02",
    type: "product",
    knowledgeType: "product_knowledge",
    language: "english",
    stage: "awareness",
    topicTags: ["target_audience", "beginner", "working_professional", "fit"],
    content: `Target Audience:
- Beginners with zero knowledge of options trading
- Traders who are currently losing money
- Working professionals seeking structured learning
- Individuals who want a disciplined, system-based approach

Not suitable for:
- People looking for quick money or jackpot trades
- Users expecting buy/sell tips
- Traders seeking high-risk speculative strategies`
  },
  {
    chunkId: "PROD-03",
    type: "product",
    knowledgeType: "product_knowledge",
    language: "english",
    stage: "awareness",
    topicTags: ["mentor_background", "credibility", "experience", "education"],
    content: `Mentor: Kundan Kishore
Education: BITS Pilani (2006) - Mathematics, Computing and Finance

Professional Background:
- Ex-investment banker at Citibank, Royal Bank of Scotland, Morgan Stanley, and Barclays Capital
- 10+ years in the finance industry
- Transitioned to teaching in 2019

Teaching Impact:
- 2,00,000+ learners impacted
- 1,400+ mentorship students trained`
  },
  {
    chunkId: "PROD-04",
    type: "product",
    knowledgeType: "product_knowledge",
    language: "english",
    stage: "consideration",
    topicTags: ["philosophy", "market_neutral", "greeks", "iv", "theta"],
    content: `Philosophy: "Profit is a by-product. Logic, neutrality, and discipline come first."

Trading Approach:
- Market-neutral strategies (no dependency on market direction)
- Focus on options pricing behavior

Core Concepts: Implied Volatility (IV), Theta Decay, Option Greeks (Delta, Vega, Gamma), Probability-based setups

Strategy Styles:
- Monthly Expiry: Iron Condor (Delta Neutral), Premium Selling, Hedged Positions
- Weekly/Intraday: Theta decay tracking, Buy trades when decay is abnormal, Strict stop-loss
- Volatility-Based: Calendar Spreads, Forward Volatility Estimation

Learning Outcome: High-probability trading, Risk-defined setups, Discipline and consistency, Logic over emotions`
  },
  {
    chunkId: "PROD-05",
    type: "product",
    knowledgeType: "product_knowledge",
    language: "english",
    stage: "consideration",
    topicTags: ["stage1", "foundation", "basics", "options_chain", "greeks"],
    content: `Stage 1: Foundation Building
Objective: Build strong conceptual clarity before entering markets.

Topics Covered:
- Basics: Derivatives, Call and Put Options, Buyer vs Seller
- Pricing and Mechanics: Strike Price, Premium, Intrinsic and Time Value
- Market Data: Option Chain, Open Interest, Volume
- Greeks and Volatility: Delta, Theta, Vega, Gamma, Implied vs Historical Volatility, IV Crush
- Strategies: Long Call/Put, Spreads (Bull, Bear), Iron Condor, Calendar Spread, Straddle/Strangle
- Risk and Discipline: Risk Management, Position Sizing, Trading Psychology
- Systems: Backtesting Basics, Paper Trading, Trade Journaling, Intro to Automation

Outcome: Strong conceptual clarity, understanding of pricing, ability to interpret market data`
  },
  {
    chunkId: "PROD-06",
    type: "product",
    knowledgeType: "product_knowledge",
    language: "english",
    stage: "consideration",
    topicTags: ["stage2", "paper_trading", "backtesting", "automation", "tools"],
    content: `Stage 2: Training Without Financial Risk
Objective: Apply learning without risking real capital.

Components:
1. Backtesting - Analyze historical data, identify strategy performance
2. Paper Trading - Simulate real trades using Excel tracking templates
3. Trade Automation - Learn execution using logic, reduce screen dependency

Tools Provided:
- Algo Trading Platform (1 month access)
- Sensibull
- Opstra

Outcome: Strategy validation, execution confidence, data-driven decision making`
  },
  {
    chunkId: "PROD-07",
    type: "product",
    knowledgeType: "product_knowledge",
    language: "english",
    stage: "consideration",
    topicTags: ["stage3", "personalized", "weekly_call", "journaling", "independence"],
    content: `Stage 3: Personalized Mentorship
Objective: Convert knowledge into a personalized trading system.

Key Elements:
1. Personal Trading Plan - built around your capital, risk appetite, and return expectations
2. Practice with No Real Money Initially - simulated execution and strategy refinement
3. Weekly Mentorship Call - Every Sunday 10:00 AM covering psychology, discipline, journaling, system building
4. Trade Journaling - Track decisions, emotions, and outcomes

Important Rule: Students cannot ask "Should I buy this?" or "Will market go up or down?" - this is by design to build independence.

Outcome: Independent trader, structured decision-maker, emotionally disciplined`
  },
  {
    chunkId: "PROD-08",
    type: "product",
    knowledgeType: "product_knowledge",
    language: "english",
    stage: "closing",
    topicTags: ["value_stack", "included", "recorded_courses", "1_to_1", "support"],
    content: `What's Included in the Mentorship:
- Live structured sessions
- Recorded courses worth Rs 20,000 (complimentary, lifetime access)
- Free e-books
- 1-to-1 sessions with Kundan Kishore
- Weekly mentorship calls (every Sunday 10 AM)
- Dedicated co-instructor support
- Repeat facility
- Algo trading tools (1 month access)
- Immediate onboarding via Zoom session
- Access to Sensibull and Opstra platforms`
  },
  {
    chunkId: "PROD-09",
    type: "product",
    knowledgeType: "product_knowledge",
    language: "english",
    stage: "closing",
    topicTags: ["differentiators", "market_neutral", "independence", "personalized", "automation"],
    content: `What Makes This Different:
- Market-neutral trading approach (no directional bets)
- No tips, no signals - builds independent traders
- Strong focus on options pricing behavior (Greeks, IV)
- Personalized 1-on-1 mentorship (not a generic course)
- Risk-free learning through paper trading before live capital
- Integration of automation tools to reduce screen dependency
- This is a mentorship plus system-building journey, not a course or signal service`
  },
  {
    chunkId: "FAQ-01",
    type: "faq",
    knowledgeType: "faq",
    language: "english",
    stage: "awareness",
    topicTags: ["beginner", "zero_knowledge", "suitable"],
    content: `Q: Is this program suitable for beginners?
A: Yes. The program starts from absolute basics - derivatives, call/put options, buyer vs seller. Beginners often do better because they don't carry wrong habits. Everything is built step by step.`
  },
  {
    chunkId: "FAQ-02",
    type: "faq",
    knowledgeType: "faq",
    language: "english",
    stage: "awareness",
    topicTags: ["technical_analysis", "ta", "greeks"],
    content: `Q: Do I need to know technical analysis?
A: No. The focus here is entirely on options pricing and Greeks - not chart reading or technical analysis. You don't need any prior TA knowledge.`
  },
  {
    chunkId: "FAQ-03",
    type: "faq",
    knowledgeType: "faq",
    language: "english",
    stage: "awareness",
    topicTags: ["capital", "paper_trading", "live_trading"],
    content: `Q: Do I need capital to start?
A: No. The program starts with paper trading (simulated trades with no real money). You only move to live trading when you feel confident and ready.`
  },
  {
    chunkId: "FAQ-04",
    type: "faq",
    knowledgeType: "faq",
    language: "english",
    stage: "closing",
    topicTags: ["lifetime_access", "recorded_content"],
    content: `Q: Is there lifetime access to content?
A: Yes. All recorded content has lifetime access.`
  },
  {
    chunkId: "FAQ-05",
    type: "faq",
    knowledgeType: "faq",
    language: "english",
    stage: "consideration",
    topicTags: ["tips", "signals", "independence"],
    content: `Q: Will I get trading tips or buy/sell calls?
A: No. This is not a tip service. The goal is to make you an independent trader who can make their own decisions with confidence and logic.`
  },
  {
    chunkId: "FAQ-06",
    type: "faq",
    knowledgeType: "faq",
    language: "english",
    stage: "consideration",
    topicTags: ["live_trades", "sessions", "concepts"],
    content: `Q: Can I ask about live trades during sessions?
A: No. Sessions are for conceptual clarity and system building only - not for real-time trade decisions.`
  },
  {
    chunkId: "FAQ-07",
    type: "faq",
    knowledgeType: "faq",
    language: "english",
    stage: "closing",
    topicTags: ["after_enrollment", "onboarding", "roadmap", "1_to_1"],
    content: `Q: What happens after I enroll?
A: After enrollment:
1. A Zoom onboarding session is scheduled
2. You get access to all recorded courses
3. 1-on-1 guidance begins
4. A personalized roadmap is created based on your capital, risk appetite, and goals`
  },
  {
    chunkId: "FAQ-08",
    type: "faq",
    knowledgeType: "faq",
    language: "english",
    stage: "closing",
    topicTags: ["batch", "schedule", "working_professionals", "flexible"],
    content: `Q: Is there a fixed batch or schedule?
A: No fixed batch. You can start anytime. The program is flexible enough for working professionals.`
  },
  {
    chunkId: "FAQ-09",
    type: "faq",
    knowledgeType: "faq",
    language: "english",
    stage: "closing",
    topicTags: ["price", "fees", "one_time_payment", "lifetime_access"],
    content: `Q: What is the price of the mentorship?
A: Rs 35,000 - one-time payment. No recurring fee. Recorded content has lifetime access.`
  },
  {
    chunkId: "FAQ-10",
    type: "faq",
    knowledgeType: "faq",
    language: "english",
    stage: "closing",
    topicTags: ["duration", "6_months", "lifetime_access"],
    content: `Q: How long is the mentorship?
A: 6 months of structured mentorship. Recorded content access is lifetime.`
  },
  {
    chunkId: "OBJ-01",
    type: "objection",
    knowledgeType: "objection",
    language: "english",
    stage: "closing",
    topicTags: ["price", "expensive", "value"],
    content: `Objection: "It's expensive" / "Rs 35,000 is a lot"

Response:
Most traders spend much more than this - either in losses or jumping between unstructured courses. This mentorship is designed to give you clarity, process, and discipline so you stop repeating those costly mistakes.

But yes - you should only join if you personally feel the value is worth it. There is no pressure here.`
  },
  {
    chunkId: "OBJ-02",
    type: "objection",
    knowledgeType: "objection",
    language: "english",
    stage: "consideration",
    topicTags: ["tips", "dependency", "independence"],
    content: `Objection: "Will you tell me which trade to take?" / "Do you give tips?"

Response:
No - and that's intentional. Dependency on tips is one of the biggest reasons traders fail long-term. The goal here is to help you make your own decisions with confidence and logic. It may feel slower initially, but it's far more powerful in the long run.`
  },
  {
    chunkId: "OBJ-03",
    type: "objection",
    knowledgeType: "objection",
    language: "english",
    stage: "consideration",
    topicTags: ["time", "busy", "working_professional", "automation"],
    content: `Objection: "I'm too busy" / "I don't have time for this"

Response:
Many people in this mentorship are working professionals. That's exactly why the program focuses on structured setups, less screen dependency, and even introduces automation. The goal is not to sit in front of screens all day - it's to trade with clarity and planning in whatever time you have.`
  },
  {
    chunkId: "OBJ-04",
    type: "objection",
    knowledgeType: "objection",
    language: "english",
    stage: "consideration",
    topicTags: ["beginner", "fear", "zero_knowledge"],
    content: `Objection: "I don't know anything about options"

Response:
That's completely fine - in fact, it's a good position to be in. Beginners often do better because they don't carry wrong habits. This program is designed to start from zero and build everything step by step.`
  },
  {
    chunkId: "OBJ-05",
    type: "objection",
    knowledgeType: "objection",
    language: "english",
    stage: "consideration",
    topicTags: ["trust", "genuine", "results", "expectations"],
    content: `Objection: "Will this really work for me?" / "How do I know it's genuine?"

Response:
Honest answer: this program doesn't promise profits. It helps you build understanding, discipline, and structured thinking. What you do with that depends on your consistency. The outcome isn't guaranteed - but the learning process is structured and proven across 1,400+ mentored students.`
  },
  {
    chunkId: "OBJ-06",
    type: "objection",
    knowledgeType: "objection",
    language: "english",
    stage: "consideration",
    topicTags: ["loss_recovery", "discipline", "system_building"],
    content: `Objection: "Can I recover my losses through this?"

Response:
Recovery doesn't come from one trade or one strategy. It comes from correct understanding, discipline, and avoiding repeated mistakes. This mentorship focuses on exactly that - and recovery becomes a by-product of building the right system, not a goal chased emotionally.`
  },
  {
    chunkId: "OBJ-07",
    type: "objection",
    knowledgeType: "objection",
    language: "english",
    stage: "awareness",
    topicTags: ["quick_money", "fast_returns", "fit"],
    content: `Objection: "Can I make quick profits?" / "I want fast returns"

Response:
Being honest with you - this mentorship is not designed for quick money. It's for people who want to build consistency, discipline, and a long-term edge. If quick profits are the primary goal, this is likely not the right fit.`
  },
  {
    chunkId: "OBJ-08",
    type: "objection",
    knowledgeType: "objection",
    language: "english",
    stage: "closing",
    topicTags: ["decide_later", "follow_up", "no_pressure"],
    content: `Objection: "I'll think about it" / "Let me decide later"

Response:
Absolutely fine. We don't follow up or push for decisions - that's a deliberate policy. Take all the time you need. Whenever you feel ready, you can come back and continue from where you left off.`
  },
  {
    chunkId: "OBJ-09",
    type: "objection",
    knowledgeType: "objection",
    language: "english",
    stage: "closing",
    topicTags: ["other_courses", "cheap", "mentorship", "1_to_1"],
    content: `Objection: "Other courses are available for much less"

Response:
That's true - there are many courses available. The difference here is that this is not a course. It's a 6-month personalized mentorship with 1-on-1 guidance, personal trading plan creation, and weekly calls. You're not just getting content - you're getting a system built around your specific situation. You should choose based on what you actually need.`
  },
  {
    chunkId: "OBJ-10",
    type: "objection",
    knowledgeType: "objection",
    language: "english",
    stage: "consideration",
    topicTags: ["fear_of_failure", "paper_trading", "readiness", "risk"],
    content: `Objection: "What if I still can't do it after the program?"

Response:
The program is not designed to rush you into live trading. You go through learning, practice, and paper trading first. You move to real capital only when you feel ready. The entire structure is built to reduce mistakes before real money is involved - so the risk of "failure" is managed throughout the journey.`
  },
  {
    chunkId: "SCRIPT-EN-00",
    type: "sales_script",
    knowledgeType: "sales_script",
    language: "english",
    stage: "awareness",
    topicTags: ["welcome", "disclaimer", "no_follow_up"],
    content: `Language: English
Step: 0 - Welcome

"Hi. I'm Kundan Kishore.
Before we begin, one important thing:
-> I will not ask for your name, email, or phone number
-> I will not follow up with you
I'm here only to help you understand the mentorship program clearly.
You can decide at your own pace."`
  },
  {
    chunkId: "SCRIPT-EN-01",
    type: "sales_script",
    knowledgeType: "sales_script",
    language: "english",
    stage: "awareness",
    topicTags: ["language_selection", "english", "hindi"],
    content: `Language: English
Step: 1 - Language Check

Ask: "Which language are you comfortable with? English / Hindi"

If English: "Perfect. We run a dedicated English batch for this mentorship."
If Hindi: Redirect to Hindi flow.`
  },
  {
    chunkId: "SCRIPT-EN-02",
    type: "sales_script",
    knowledgeType: "sales_script",
    language: "english",
    stage: "awareness",
    topicTags: ["experience", "loss", "sebi", "structured_approach"],
    content: `Language: English
Step: 2 - Options Trading Experience

Ask: "Have you ever traded in Options? Yes / No"

If Yes -> "Have you faced losses? Yes / No"
If Yes -> "How much? Less than Rs 1L / More than Rs 1L"
Response: "As per SEBI data, the average retail trader has lost more than Rs 1.5 lakh in options trading. This doesn't happen because people don't try - it happens because they don't follow a structured approach. With the right learning and process, things can change."

If No -> "That's actually a good place to start. Most people enter options trading without proper understanding - and that's where problems begin."`
  },
  {
    chunkId: "SCRIPT-EN-03",
    type: "sales_script",
    knowledgeType: "sales_script",
    language: "english",
    stage: "awareness",
    topicTags: ["mentor_intro", "credibility", "background"],
    content: `Language: English
Step: 3 - Mentor Intro

"Before we move ahead, it's important you know your mentor.
-> BITS Pilani graduate (Mathematics, Finance)
-> Worked at Morgan Stanley, Barclays, RBS
-> Taught 2,00,000+ learners
-> Mentored 1,700+ traders

My focus is simple: Help you trade with logic, not guesswork."`
  },
  {
    chunkId: "SCRIPT-EN-04",
    type: "sales_script",
    knowledgeType: "sales_script",
    language: "english",
    stage: "consideration",
    topicTags: ["quiz", "knowledge_test", "engagement"],
    content: `Language: English
Step: 4 - Quiz Offer

Ask: "Before I explain the program - would you like to take a quick knowledge test? Yes / No"

If Yes -> "How many questions? 5 / 10"
If No -> Proceed to Step 5 (Program Explanation).`
  },
  {
    chunkId: "SCRIPT-EN-04B",
    type: "sales_script",
    knowledgeType: "sales_script",
    language: "english",
    stage: "consideration",
    topicTags: ["quiz_result", "understanding", "risking_capital"],
    content: `Language: English
Step: 4B - Quiz Result Handling

High Score: "Good. You already have some understanding."
Low Score: "This is exactly where most traders struggle."

Key Line:
"In trading, even one wrong decision can cost real money. Ideally, your understanding should be close to 10/10 before risking capital."`
  },
  {
    chunkId: "SCRIPT-EN-05",
    type: "sales_script",
    knowledgeType: "sales_script",
    language: "english",
    stage: "closing",
    topicTags: ["program_pitch", "3_stages", "included", "no_pressure"],
    content: `Language: English
Step: 5 - Program Pitch

"This mentorship is designed in 3 stages:
1. Foundation - Understand options deeply: Greeks, volatility, pricing
2. Training - Practice using backtesting and paper trading, no real money
3. Mentorship - I personally guide you to build your own trading system

You also get:
Live structured sessions
Recorded courses worth Rs 20,000 (complimentary)
Free e-books
1-to-1 sessions
Weekly mentorship calls
Dedicated co-instructor support
Repeat facility
Algo trading tools
Immediate onboarding

We don't follow up. We don't push you to buy. You decide only if this feels right for you."`
  },
  {
    chunkId: "SCRIPT-EN-06",
    type: "sales_script",
    knowledgeType: "sales_script",
    language: "english",
    stage: "consideration",
    topicTags: ["open_qa", "questions", "conversation"],
    content: `Language: English
Step: 6 - Open Conversation

"Now it's your turn.
You can ask me anything about:
-> The program
-> Options trading
-> Your specific situation
I'll guide you honestly."`
  },
  {
    chunkId: "SCRIPT-HI-00",
    type: "sales_script",
    knowledgeType: "sales_script",
    language: "hindi",
    stage: "awareness",
    topicTags: ["welcome", "hindi", "no_follow_up"],
    content: `Language: Hindi
Step: 0 - Welcome

"Hi. Main Kundan Kishore hoon.
Aage badhne se pehle ek important baat:
-> Main aapse naam, email ya mobile number nahi loonga
-> Main aapko follow-up bhi nahi karunga
Main sirf aapko program samajhne mein help karunga.
Decision aap apni marzi se lenge."`
  },
  {
    chunkId: "SCRIPT-HI-02",
    type: "sales_script",
    knowledgeType: "sales_script",
    language: "hindi",
    stage: "awareness",
    topicTags: ["experience", "hindi", "loss", "sebi"],
    content: `Language: Hindi
Step: 2 - Experience

Ask: "Kya aapne kabhi Options trading ki hai? Haan / Nahin"

If Haan -> "Kya aapko loss hua? Haan / Nahin"
Loss -> "SEBI data ke according, average retail trader ne Rs 1.5 lakh se zyada loss kiya hai. Yeh structure ki kami ki wajah se hota hai. Sahi guidance ke saath sab change ho sakta hai."

If Nahin -> "Yeh achhi baat hai. Lekin bina proper understanding ke shuru karna future mein problem create karta hai."`
  },
  {
    chunkId: "SCRIPT-HI-05",
    type: "sales_script",
    knowledgeType: "sales_script",
    language: "hindi",
    stage: "closing",
    topicTags: ["program_pitch", "hindi", "3_stages", "support"],
    content: `Language: Hindi
Step: 5 - Program

"Yeh mentorship 3 stages mein hai:
1. Foundation
2. Training
3. Mentorship

Saath mein milega:
Live classes
Rs 20,000 ke recorded courses free
1-to-1 sessions
Weekly calls
Doubt support
Repeat facility
Algo tools

Hum follow-up nahi karte. Hum pressure nahi daalte. Decision aapka hai."`
  }
];

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large";
const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";

const chunkArray = (array, size) => {
  const result = [];

  for (let index = 0; index < array.length; index += size) {
    result.push(array.slice(index, index + size));
  }

  return result;
};

const buildEmbeddingInput = (item) =>
  [
    `Chunk ID: ${item.chunkId}`,
    `Knowledge Type: ${item.knowledgeType}`,
    `Language: ${item.language}`,
    `Stage: ${item.stage}`,
    `Topic Tags: ${item.topicTags.join(", ")}`,
    "",
    item.content
  ].join("\n");

const createEmbeddingsDirectly = async (items) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const batches = chunkArray(items, 20);
  const embeddingsByChunkId = new Map();

  for (const batch of batches) {
    const response = await fetch(OPENAI_EMBEDDINGS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: batch.map(buildEmbeddingInput)
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        `OpenAI embeddings request failed: ${response.status} ${JSON.stringify(payload)}`
      );
    }

    payload.data.forEach((entry, index) => {
      embeddingsByChunkId.set(batch[index].chunkId, entry.embedding);
    });
  }

  return embeddingsByChunkId;
};

const connectMongoIfConfigured = async () => {
  if (!process.env.MONGODB_URI) {
    return false;
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  });

  return true;
};

const upsertKnowledgeDocuments = async (items) => {
  const byChunkId = new Map();

  for (const item of items) {
    const existing = await Knowledge.findOne({
      type: item.type,
      content: item.content
    });

    const knowledge =
      existing ||
      (await Knowledge.create({
        type: item.type,
        content: item.content
      }));

    byChunkId.set(item.chunkId, String(knowledge._id));
  }

  return byChunkId;
};

const upsertVectorsToPinecone = async ({ items, embeddingsByChunkId, mongoIdsByChunkId }) => {
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
    throw new Error("PINECONE_API_KEY or PINECONE_INDEX_NAME is missing.");
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });

  const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
  const namespace = process.env.PINECONE_NAMESPACE;
  const target = namespace ? index.namespace(namespace) : index;

  const records = items.map((item) => ({
    id: `manual_${item.chunkId}`,
    values: embeddingsByChunkId.get(item.chunkId),
    metadata: {
      knowledgeId: mongoIdsByChunkId.get(item.chunkId) || "",
      type: item.type,
      knowledge_type: item.knowledgeType,
      language: item.language,
      stage: item.stage,
      chunk_id: item.chunkId,
      topic_tags: item.topicTags,
      content: item.content
    }
  }));

  const recordBatches = chunkArray(records, 100);

  for (const batch of recordBatches) {
    await target.upsert({
      records: batch
    });
  }

  return {
    namespace: namespace || "default",
    recordsUpserted: records.length
  };
};

const main = async () => {
  console.log(`Preparing ${KNOWLEDGE_ITEMS.length} supplied knowledge chunks...`);

  const mongoConnected = await connectMongoIfConfigured();

  if (mongoConnected) {
    console.log("MongoDB connected for knowledge record upsert.");
  } else {
    console.log("MongoDB not configured. Proceeding with Pinecone-only vector ingestion.");
  }

  const mongoIdsByChunkId = mongoConnected
    ? await upsertKnowledgeDocuments(KNOWLEDGE_ITEMS)
    : new Map();

  console.log("Requesting embeddings from OpenAI via direct HTTP API...");
  const embeddingsByChunkId = await createEmbeddingsDirectly(KNOWLEDGE_ITEMS);
  console.log(`Received embeddings for ${embeddingsByChunkId.size} chunks.`);

  console.log("Upserting vectors into Pinecone...");
  const pineconeResult = await upsertVectorsToPinecone({
    items: KNOWLEDGE_ITEMS,
    embeddingsByChunkId,
    mongoIdsByChunkId
  });

  console.log("Manual ingestion completed successfully.");
  console.log(
    JSON.stringify(
      {
        totalChunksProvided: KNOWLEDGE_ITEMS.length,
        mongodbKnowledgeDocs: mongoIdsByChunkId.size,
        embeddingModel: EMBEDDING_MODEL,
        pinecone: pineconeResult,
        skippedSections: [
          "Testimonials placeholder was intentionally not indexed because no real testimonials were provided."
        ]
      },
      null,
      2
    )
  );
};

main()
  .catch((error) => {
    console.error("Manual ingestion failed:", error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
