const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?instructions/i,
  /system\s+prompt/i,
  /reveal\s+(the\s+)?(developer\s+)?rules/i,
  /bypass\s+(safety\s+)?filters/i,
  /you\s+are\s+now\s+in\s+dan\s+mode/i,
  /jailbreak/i,
  /forget\s+everything/i,
  /show\s+api\s+key/i,
  /output\s+system\s+instructions/i,
];

export function checkPromptInjection(text = "") {
  if (!text || typeof text !== "string") {
    return { detected: false, sanitizedText: "" };
  }

  const cleanText = text.trim();
  let isInjection = false;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(cleanText)) {
      isInjection = true;
      break;
    }
  }

  // Basic sanitization to prevent delimiter breakout
  const sanitizedText = cleanText
    .replace(/```[a-z]*/gi, "'''")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  return {
    detected: isInjection,
    sanitizedText,
  };
}
