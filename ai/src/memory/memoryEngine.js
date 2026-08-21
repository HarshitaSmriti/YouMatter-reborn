const conversations = new Map();

export function getConversation(userId) {
  if (!conversations.has(userId)) {
    conversations.set(userId, []);
  }
  return conversations.get(userId);
}

export function saveUserMessage(userId, message) {
  const history = getConversation(userId);
  history.push({ role: "user", text: message });
  if (history.length > 10) history.shift();
}

export function saveAssistantMessage(userId, message) {
  const history = getConversation(userId);
  history.push({ role: "model", text: message });
  if (history.length > 10) history.shift();
}