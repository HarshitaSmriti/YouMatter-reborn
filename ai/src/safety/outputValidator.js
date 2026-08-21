const FORBIDDEN_OUTPUT_PATTERNS = [
  /i\s+diagnose\s+you\s+with/i,
  /take\s+this\s+medication/i,
  /stop\s+taking\s+your\s+prescribed/i,
  /guarantee\s+you\s+will\s+get\s+the\s+job/i,
  /your\s+starting\s+salary\s+will\s+be/i,
  /my\s+system\s+prompt\s+is/i,
  /my\s+secret\s+instructions/i,
];

export function validateOutput(text = "") {
  if (!text || typeof text !== "string") return "";

  let sanitized = text.trim();

  for (const pattern of FORBIDDEN_OUTPUT_PATTERNS) {
    if (pattern.test(sanitized)) {
      console.warn("AI Output Safety Rule Triggered for pattern:", pattern);
      return "I'm here to support your well-being and listen with warmth, but I cannot provide medical diagnoses, prescribe medications, or guarantee specific employment outcomes. How are you feeling right now?";
    }
  }

  return sanitized;
}
