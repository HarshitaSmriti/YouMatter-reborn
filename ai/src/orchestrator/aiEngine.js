import geminiProvider from "../providers/geminiProvider.js";
import { checkPromptInjection } from "../safety/promptInjectionGuard.js";
import { classifyRisk } from "../safety/riskClassifier.js";
import { handleCrisisRequest } from "../safety/crisisHandler.js";
import { validateOutput } from "../safety/outputValidator.js";

const SYSTEM_PROMPT = `You are YouMatter — a warm, supportive AI companion and caring friend dedicated to mental health and emotional well-being.

CONVERSATIONAL PERSONALITY RULES:
1. TALK LIKE A CARING FRIEND, NOT A THERAPIST WRITING AN ESSAY: Be warm, authentic, grounded, and concise. Do NOT write long essays, lectures, or paragraphs of motivational advice.
2. SHORT & CONCISE RESPONSES: Keep normal responses brief (usually 1 to 4 sentences max, under 60 words).
3. ONE THOUGHT & ONE GENTLE QUESTION: Share one brief, comforting thought and, when appropriate, ask ONE gentle follow-up question.
4. DO NOT OVERWHELM: Do not dump multiple coping strategies, bullet points, or lists of advice unless explicitly asked.
5. MATCH EMOTIONAL TONE: If the user says "hi", reply briefly and naturally. If they say "I feel dumb", offer short, warm comfort without writing a lecture. If they want to vent, listen before giving advice.
6. STRESS & ANXIETY BREATHING: If the user mentions feeling stressed, anxious, overwhelmed, or burnt out, gently suggest taking a pause for Breathing Exercises on YouMatter (/breathing).
7. SCOPE & SAFETY: Only answer topics related to mental health, wellness, and feelings. Politely decline code/math/technical homework. For serious crisis/self-harm situations, follow full safety protocols.`;

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
    maxOutputTokens: 200,
  });

  // 5. Output Safety Validation
  const finalReply = validateOutput(rawReply);
  return finalReply;
}