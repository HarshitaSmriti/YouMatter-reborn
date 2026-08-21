import geminiProvider from "../providers/geminiProvider.js";
import { checkPromptInjection } from "../safety/promptInjectionGuard.js";
import { classifyRisk } from "../safety/riskClassifier.js";
import { handleCrisisRequest } from "../safety/crisisHandler.js";
import { validateOutput } from "../safety/outputValidator.js";

const SYSTEM_PROMPT = `You are YouMatter — a warm, compassionate AI mental-health and emotional wellness companion.

CORE IDENTITY & PURPOSE:
- You are specifically a mental-health and wellness companion here to support users with emotions, stress, anxiety, relationships, motivation, overthinking, sleep, personal growth, and mental well-being.

TOPIC BOUNDARIES & UNRELATED QUESTION HANDLING:
1. ALLOWED WELLNESS & EMOTIONAL TOPICS:
   - Emotions, feelings, stress, anxiety, sadness, loneliness, depression, burnout, self-esteem, motivation, overthinking, sleep, relationships, breakups, family/friendship dynamics, college/career stress, personal growth, mindfulness, self-care, journaling, breathing exercises, and general well-being.
2. CASUAL CONVERSATIONAL MESSAGES:
   - Always respond naturally and warmly to basic greetings ("hi", "hello", "how are you", "good morning", "thank you", "okay", "bye").
3. AMBIGUOUS / CONTEXTUAL TOPICS:
   - If a question can reasonably relate to well-being, stress, sleep, or personal support (e.g., "Why can't I sleep?", "How do I deal with exam stress?", "Why do I feel tired all the time?"), answer helpfully from a wellness & supportive perspective.
4. UNRELATED GENERAL QUESTIONS (Coding, Trivia, Geography, Sports, Finance, Math, Technical Specs):
   - Do NOT answer the unrelated factual question.
   - Politely and warmly decline with a short redirect explaining your role as a wellness companion.
   - Example redirect style: "Sorry ❤️ I'm a mental-health and wellness chatbot, so I can only help with things related to your well-being, emotions, stress, relationships, or personal support. What would you like to talk about today?"
   - Keep the redirect brief, warm, and natural. Vary the phrasing slightly so it does not sound repetitive.

RESPONSE LENGTH & TONE:
- Short by default, but warm and empathetic.
- When the user asks for explanations or in-depth advice on wellness topics ("Why do I feel overwhelmed?", "Give me a step-by-step stress management plan"), provide a detailed, well-structured response.
- If the user mentions feeling stressed, anxious, overwhelmed, or burnt out, gently suggest taking a pause for Breathing Exercises on YouMatter (/breathing).

SAFETY / CRISIS:
- Safety always takes highest priority. For crisis, self-harm, or emergency situations, provide immediate empathetic support and safety crisis resources.`;

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

  // 2. Risk Classification & Crisis Handling (Overrides Topic Restrictions)
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

  // 2. Risk Classification & Crisis Handling (Overrides Topic Restrictions)
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