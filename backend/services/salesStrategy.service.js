const KEYWORD_GROUPS = {
  buyingIntent: [
    "join",
    "enroll",
    "register",
    "buy",
    "purchase",
    "payment",
    "fees",
    "fee",
    "price",
    "pricing",
    "book a call",
    "call me",
    "admission",
    "start now"
  ],
  priceObjection: [
    "expensive",
    "costly",
    "too much",
    "price",
    "pricing",
    "fees",
    "fee",
    "budget",
    "afford"
  ],
  trustObjection: [
    "real",
    "genuine",
    "scam",
    "fake",
    "proof",
    "result",
    "testimonial",
    "trust",
    "legit"
  ],
  beginnerConcern: [
    "beginner",
    "basic",
    "new to trading",
    "starting",
    "freshers",
    "no experience",
    "from scratch"
  ],
  timeConcern: [
    "time",
    "busy",
    "job",
    "working",
    "schedule",
    "timing",
    "weekend"
  ],
  riskConcern: [
    "loss",
    "risky",
    "risk",
    "safe",
    "capital",
    "blown account",
    "fear"
  ],
  curriculumQuestion: [
    "syllabus",
    "curriculum",
    "what will i learn",
    "topics",
    "modules",
    "covered"
  ],
  socialProofQuestion: [
    "results",
    "success stories",
    "testimonial",
    "reviews",
    "students"
  ]
};

const normalizeText = (text) => text.toLowerCase().trim();

const containsAnyKeyword = (text, keywords) =>
  keywords.some((keyword) => text.includes(keyword));

const detectLanguageMode = (message, history) => {
  const combinedText = normalizeText(
    [message, ...history.map((item) => item.content)].join(" ")
  );

  const hasHindiScript = /[\u0900-\u097F]/.test(combinedText);
  const hasHinglishSignal = [
    "haan",
    "nahi",
    "samajh",
    "achha",
    "kaise",
    "kya",
    "kyu",
    "mujhe",
    "sir",
    "bhai"
  ].some((keyword) => combinedText.includes(keyword));

  if (hasHindiScript) {
    return "hindi";
  }

  if (hasHinglishSignal) {
    return "hinglish";
  }

  return "english";
};

const detectSignals = (message) => {
  const normalizedMessage = normalizeText(message);

  return {
    buyingIntent: containsAnyKeyword(normalizedMessage, KEYWORD_GROUPS.buyingIntent),
    priceObjection: containsAnyKeyword(normalizedMessage, KEYWORD_GROUPS.priceObjection),
    trustObjection: containsAnyKeyword(normalizedMessage, KEYWORD_GROUPS.trustObjection),
    beginnerConcern: containsAnyKeyword(normalizedMessage, KEYWORD_GROUPS.beginnerConcern),
    timeConcern: containsAnyKeyword(normalizedMessage, KEYWORD_GROUPS.timeConcern),
    riskConcern: containsAnyKeyword(normalizedMessage, KEYWORD_GROUPS.riskConcern),
    curriculumQuestion: containsAnyKeyword(
      normalizedMessage,
      KEYWORD_GROUPS.curriculumQuestion
    ),
    socialProofQuestion: containsAnyKeyword(
      normalizedMessage,
      KEYWORD_GROUPS.socialProofQuestion
    )
  };
};

const determineLeadStage = (signals, history) => {
  if (signals.buyingIntent) {
    return "decision";
  }

  if (
    signals.priceObjection ||
    signals.trustObjection ||
    signals.timeConcern ||
    signals.riskConcern
  ) {
    return "objection";
  }

  if (history.length <= 2) {
    return "awareness";
  }

  return "consideration";
};

const buildStrategyNotes = ({ signals, leadStage, languageMode, retrievalCount }) => {
  const notes = [
    `Lead stage: ${leadStage}`,
    `Preferred response language: ${languageMode}`,
    `Retrieved knowledge documents available: ${retrievalCount}`
  ];

  if (signals.beginnerConcern) {
    notes.push(
      "Reassure the user that beginners can succeed if the context supports it, and explain the learning path clearly."
    );
  }

  if (signals.priceObjection) {
    notes.push(
      "Handle the price objection by focusing on value, transformation, and avoided mistakes. Do not invent discounts."
    );
  }

  if (signals.trustObjection || signals.socialProofQuestion) {
    notes.push(
      "Use proof, credibility, and testimonials from retrieved context when available. Never fabricate social proof."
    );
  }

  if (signals.timeConcern) {
    notes.push(
      "Address scheduling and consistency concerns with a practical, empathetic tone."
    );
  }

  if (signals.riskConcern) {
    notes.push(
      "Acknowledge risk honestly. Position the program as education and disciplined learning, not guaranteed profits."
    );
  }

  if (signals.curriculumQuestion) {
    notes.push(
      "Explain what the learner will cover, using specific modules or outcomes from retrieved context when available."
    );
  }

  if (signals.buyingIntent) {
    notes.push(
      "The user is showing buying intent. End with a crisp CTA to enroll or book a call, but avoid sounding pushy."
    );
  } else if (leadStage === "consideration" || leadStage === "objection") {
    notes.push(
      "End with one low-friction next step question that moves the conversation forward."
    );
  }

  return notes;
};

const buildConversationSummary = (history) => {
  const recentTurns = history.slice(-6);

  if (recentTurns.length === 0) {
    return "No prior conversation history.";
  }

  return recentTurns
    .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
    .join("\n");
};

const analyzeSalesContext = ({ message, history = [], retrievedDocuments = [] }) => {
  const signals = detectSignals(message);
  const leadStage = determineLeadStage(signals, history);
  const languageMode = detectLanguageMode(message, history);

  return {
    signals,
    leadStage,
    languageMode,
    conversationSummary: buildConversationSummary(history),
    strategyNotes: buildStrategyNotes({
      signals,
      leadStage,
      languageMode,
      retrievalCount: retrievedDocuments.length
    })
  };
};

module.exports = {
  analyzeSalesContext
};
