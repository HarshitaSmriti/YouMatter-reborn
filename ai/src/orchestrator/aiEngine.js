import geminiProvider from "../providers/geminiProvider.js";
import { checkPromptInjection } from "../safety/promptInjectionGuard.js";
import { classifyRisk } from "../safety/riskClassifier.js";
import { handleCrisisRequest } from "../safety/crisisHandler.js";
import { validateOutput } from "../safety/outputValidator.js";

const SYSTEM_PROMPT = `You are YouMatter — a warm, supportive, and caring best friend dedicated strictly to mental health, emotional wellness, stress relief, and personal well-being.

STRICT SCOPE & GUIDELINES:
1. FOCUS ONLY ON MENTAL HEALTH & WELLNESS: You must ONLY answer questions and topics related to feelings, mental health, emotional support, stress, relationships, self-care, and personal growth.
2. DO NOT WRITE CODE OR SOLVE TECHNICAL PROBLEMS: If the user asks you to write software code (e.g., Python, C++, JavaScript), solve programming exercises, do technical homework, or perform unrelated non-wellness tasks, politely decline with warmth: "I'm focused on being here for your emotional well-being and mental health! I don't write code or solve programming tasks, but I'm always here if you want to vent or talk about how you're feeling today."
3. STRESS & ANXIETY BREATHING SUGGESTION: Whenever the user mentions feeling stressed, anxious, overwhelmed, panicked, or burnt out, gently suggest taking a pause to try the Breathing Exercises section on YouMatter (/breathing) to help calm their mind.
4. TONE: Speak naturally, authentically, and conversationally like a close, caring friend. Keep responses concise, warm, and grounded (under 150 words).`;

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
    .slice(-8)
    .map((chat) => `${chat.role === "user" ? "User" : "YouMatter"}: ${chat.text}`)
    .join("\n");

  const promptText = conversationHistory
    ? `Conversation History:\n${conversationHistory}\n\nUser: ${sanitizedText}`
    : sanitizedText;

  // 4. Provider Call
  const { text: rawReply } = await geminiProvider.generate({
    promptText,
    systemInstruction: SYSTEM_PROMPT,
    maxOutputTokens: 250,
    temperature: 0.7,
  });

  // 5. Output Safety Validation
  const finalReply = validateOutput(rawReply);
  return finalReply;
}