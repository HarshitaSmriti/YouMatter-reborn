const HIGH_RISK_KEYWORDS = [
  "suicide", "kill myself", "want to die", "end my life", "ending it all",
  "self harm", "cut myself", "slit my wrists", "overdose", "hanging myself",
  "hurt someone", "kill them"
];

const MEDIUM_RISK_KEYWORDS = [
  "hopeless", "can't go on", "overwhelmed", "panic attack", "worthless",
  "nobody cares", "depression", "breakdown"
];

export function classifyRisk(text = "") {
  if (!text || typeof text !== "string") return { level: "LOW", score: 0 };

  const lower = text.toLowerCase();

  for (const keyword of HIGH_RISK_KEYWORDS) {
    if (lower.includes(keyword)) {
      return { level: "HIGH", score: 1.0, keyword };
    }
  }

  for (const keyword of MEDIUM_RISK_KEYWORDS) {
    if (lower.includes(keyword)) {
      return { level: "MEDIUM", score: 0.5, keyword };
    }
  }

  return { level: "LOW", score: 0.0 };
}
