const buildMockSalesReply = ({ message, history = [] }) => {
  const trimmedMessage = message.trim();
  const recentTurns = history.slice(-5);

  return {
    reply: `Thanks for your question. You said: "${trimmedMessage}". I am using a placeholder sales response for now. In the next step, this will be replaced with a real OpenAI-generated reply.`,
    usage: {
      historyMessagesUsed: recentTurns.length
    }
  };
};

module.exports = {
  buildMockSalesReply
};
