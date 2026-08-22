const HIGH_RISK_KEYWORDS = [
  "suicide", "kill myself", "want to die", "end my life", "ending it all",
  "self harm", "cut myself", "slit my wrists", "overdose", "hanging myself",
  "hurt someone", "kill them",
  "mar jana chahta", "mar jana chahti", "marne ka mann", "marne ki soch",
  "khud ko mar", "jaan dene", "khudkhushi",
  "आत्महत्या", "खुद को मारना", "मरना चाहता", "मरना चाहती", "जीने का मन नहीं"
];

const MEDIUM_RISK_KEYWORDS = [
  "hopeless", "can't go on", "overwhelmed", "panic attack", "worthless",
  "nobody cares", "depression", "breakdown",
  "sab khatam", "kuch nahi bacha", "bht pareshan", "bahut pareshan"
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
