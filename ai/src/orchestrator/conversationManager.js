import {
  getConversation,
  saveUserMessage,
  saveAssistantMessage,
} from "../memory/memoryEngine.js";
import { generateReply, generateReplyStream } from "./aiEngine.js";

export async function processMessage(userId, message) {
  if (!message || !message.trim()) {
    return {
      success: false,
      error: "Message cannot be empty.",
    };
  }

  const history = getConversation(userId);

  try {
    const reply = await generateReply({ userId, message: message.trim(), history });

    saveUserMessage(userId, message);
    saveAssistantMessage(userId, reply);

    return {
      success: true,
      reply,
    };
  } catch (error) {
    console.error("Gemini AI API Error:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
}

export async function processMessageStream(userId, message, onChunk) {
  if (!message || !message.trim()) {
    return {
      success: false,
      error: "Message cannot be empty.",
    };
  }

  const history = getConversation(userId);

  try {
    const reply = await generateReplyStream({ userId, message: message.trim(), history }, onChunk);

    saveUserMessage(userId, message);
    saveAssistantMessage(userId, reply);

    return {
      success: true,
      reply,
    };
  } catch (error) {
    console.error("Gemini AI Stream API Error:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
}