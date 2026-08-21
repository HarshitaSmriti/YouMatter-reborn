import geminiProvider from "../providers/geminiProvider.js";
import { checkPromptInjection } from "../safety/promptInjectionGuard.js";
import { classifyRisk } from "../safety/riskClassifier.js";
import { handleCrisisRequest } from "../safety/crisisHandler.js";
import { validateOutput } from "../safety/outputValidator.js";

const SYSTEM_PROMPT = `You are YouMatter — a warm, supportive AI companion and caring friend.

GENERAL CONVERSATION (General Questions, Coding, Trivia, Math, Interview Prep, Jokes):
- Answer the user's actual question directly, accurately, and naturally.
- Help with coding, math, general trivia, interview prep, jokes, or any everyday topic.
- Do NOT force mental-health language into unrelated topics.
- Do NOT repeatedly ask "how are you feeling?" or redirect general questions back to wellness.

EMOTIONAL / WELLNESS CONVERSATION (Stress, Overwhelm, Feelings, Venting):
- Become warmer, more attentive, and supportive.
- Listen before giving advice.
- Do not overwhelm the user with unsolicited lists of advice unless requested.
- Ask at most one gentle follow-up question when appropriate.
- If the user mentions feeling stressed, anxious, overwhelmed, or burnt out, gently suggest taking a pause for Breathing Exercises on YouMatter (/breathing).

SAFETY / CRISIS:
- For serious crisis, self-harm, or emergency situations, follow the application's emergency safety protocols.`;

export async function generateReply(aiRequest) {
  const { message = "", history = [] } =
    typeof aiRequest === "string" ? { message: aiRequest } : aiRequest || {};

  const cleanMessage = message.trim();
  if (!cleanMessage) {
    return "I'm right here with you. What would you like to talk about today?";
  }

  // 1. Prompt Injection Defense
  const { detected: isInjection, sanitizedText } = checkPromptInjection(cleanMessage);
  if (isInjection) {
    return "I'm focused on being a warm, supportive companion for your mental well-being! I can't modify my core safety rules or reveal system instructions, but I'm always here to listen to how you're feeling today.";
  }

  // 2. Risk Classification & Crisis Handling
  const risk = classifyRisk(sanitizedText);
  if (risk.level === "HIGH") {
    const crisisResponse = handleCrisisRequest(risk);
    return crisisResponse.reply;
  }

  // 3. Context Construction
  const conversationHistory = history
    .slice(-6)
    .map((chat) => `${chat.role === "user" ? "User" : "YouMatter"}: ${chat.text}`)
    .join("\n");

  const promptText = conversationHistory
    ? `Conversation History:\n${conversationHistory}\n\nUser: ${sanitizedText}`
    : sanitizedText;

  // 4. Provider Call
  const { text: rawReply } = await geminiProvider.generate({
    promptText,
    systemInstruction: SYSTEM_PROMPT,
    maxOutputTokens: 1000,
  });

  // 5. Output Safety Validation
  const finalReply = validateOutput(rawReply);
  return finalReply;
}

export async function generateReplyStream(aiRequest, onChunk) {
  const { message = "", history = [] } =
    typeof aiRequest === "string" ? { message: aiRequest } : aiRequest || {};

  const cleanMessage = message.trim();
  if (!cleanMessage) {
    const msg = "I'm right here with you. What would you like to talk about today?";
    if (onChunk) onChunk(msg);
    return msg;
  }

  // 1. Prompt Injection Defense
  const { detected: isInjection, sanitizedText } = checkPromptInjection(cleanMessage);
  if (isInjection) {
    const msg = "I'm focused on being a warm, supportive companion for your mental well-being! I can't modify my core safety rules or reveal system instructions, but I'm always here to listen to how you're feeling today.";
    if (onChunk) onChunk(msg);
    return msg;
  }

  // 2. Risk Classification & Crisis Handling
  const risk = classifyRisk(sanitizedText);
  if (risk.level === "HIGH") {
    const crisisResponse = handleCrisisRequest(risk);
    if (onChunk) onChunk(crisisResponse.reply);
    return crisisResponse.reply;
  }

  // 3. Context Construction
  const conversationHistory = history
    .slice(-6)
    .map((chat) => `${chat.role === "user" ? "User" : "YouMatter"}: ${chat.text}`)
    .join("\n");

  const promptText = conversationHistory
    ? `Conversation History:\n${conversationHistory}\n\nUser: ${sanitizedText}`
    : sanitizedText;

  // 4. Provider Stream Call
  const { text: rawReply } = await geminiProvider.generateStream({
    promptText,
    systemInstruction: SYSTEM_PROMPT,
    maxOutputTokens: 1000,
    onChunk,
  });

  // 5. Output Safety Validation
  const finalReply = validateOutput(rawReply);
  return finalReply;
}