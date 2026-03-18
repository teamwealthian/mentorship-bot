const normalizeWhitespace = (text) => text.replace(/\s+/g, " ").trim();

const splitIntoSentences = (text) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => normalizeWhitespace(sentence))
    .filter(Boolean);

const chunkText = (text, options = {}) => {
  const maxChunkLength = options.maxChunkLength || 700;
  const overlapSentences = options.overlapSentences || 1;
  const normalizedText = normalizeWhitespace(text);

  if (!normalizedText) {
    return [];
  }

  const sentences = splitIntoSentences(normalizedText);

  if (sentences.length === 0) {
    return [normalizedText];
  }

  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    const candidateChunk = currentChunk
      ? `${currentChunk} ${sentence}`
      : sentence;

    if (candidateChunk.length <= maxChunkLength) {
      currentChunk = candidateChunk;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    currentChunk = sentence;
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  if (chunks.length <= 1 || overlapSentences <= 0) {
    return chunks;
  }

  return chunks.map((chunk, index) => {
    if (index === 0) {
      return chunk;
    }

    const previousSentences = splitIntoSentences(chunks[index - 1]);
    const overlap = previousSentences.slice(-overlapSentences).join(" ");

    return normalizeWhitespace(`${overlap} ${chunk}`);
  });
};

module.exports = {
  chunkText
};
