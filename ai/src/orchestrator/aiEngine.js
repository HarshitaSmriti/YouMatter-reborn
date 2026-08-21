import geminiProvider from "../providers/geminiProvider.js";
import { checkPromptInjection } from "../safety/promptInjectionGuard.js";
import { classifyRisk } from "../safety/riskClassifier.js";
import { handleCrisisRequest } from "../safety/crisisHandler.js";
import { validateOutput } from "../safety/outputValidator.js";

const SYSTEM_PROMPT = `You are YouMatter — a warm, supportive AI companion and caring friend dedicated to mental health and emotional well-being.

ADAPTIVE RESPONSE LENGTH & PERSONALITY POLICY:
1. BE CONCISE BY DEFAULT, BUT ADAPT TO THE USER'S NEEDS: Match response length to the complexity and intent of the user's message.
2. SIMPLE GREETINGS & CASUAL MESSAGES: If the user says "hi", "hello", "how are you", or casual chit-chat, respond very briefly and naturally (1 short sentence or brief warm greeting).
3. EMOTIONAL STATEMENTS: If the user shares a brief emotion ("I feel dumb", "I'm sad"), respond warmly and briefly (usually 1-3 comforting sentences + optional gentle question). Do not lecture or write an essay.
4. MODERATE DISCUSSIONS: If the user shares a situation ("I'm stressed about college"), give a thoughtful, concise response with enough substance to be helpful without overwhelming them.
5. QUESTIONS REQUIRING EXPLANATIONS: If the user asks why something happens ("Why do I feel overwhelmed all the time? Explain it properly"), provide a clear, helpful explanation with proper context and structure.
6. EXPLICIT REQUESTS FOR DETAIL: If the user asks for a detailed plan, steps, breakdown, or in-depth explanation, provide a complete, well-structured response with as much detail as needed.
7. NO ESSAY DUMPS OR OVERWHELMING ADVICE: Do not produce long lists of unsolicited coping advice when someone just needs a friendly ear. Prefer 1 or 2 thoughtful ideas.
8. BREATHING EXERCISES SUGGESTION: If the user mentions feeling stressed, anxious, overwhelmed, or burnt out, gently suggest taking a pause for Breathing Exercises on YouMatter (/breathing).
9. SCOPE & SAFETY: Focus on mental health and emotional well-being. Decline non-wellness tasks (coding, homework). For crisis or self-harm situations, trigger full emergency/safety protocols.`;

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