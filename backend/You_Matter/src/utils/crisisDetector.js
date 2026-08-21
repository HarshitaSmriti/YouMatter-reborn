const englishPatterns = [
  /\b(die|wanna\s+die|want\s+to\s+die|should\s+die|wish\s+i\s+was\s+dead|wish\s+i\s+were\s+dead|better\s+off\s+dead|rather\s+be\s+dead)\b/i,
  /\b(kill\s+myself|end\s+my\s+life|take\s+my\s+life|end\s+it\s+all|ending\s+my\s+life|ending\s+it)\b/i,
  /\b(poi?so?n|poision|poisoning|drink\s+poison|swallow\s+poison|ingest\s+poison|cyanide)\b/i,
  /\b(hang\s+myself|hanging|hang\s+my\s+self|hang\s+me|noose)\b/i,
  /\b(no\s+reason\s+to\s+live|don't\s+want\s+to\s+live|dont\s+want\s+to\s+live|hate\s+living|stop\s+living)\b/i,
  /\b(suicide|suicidal|self\s*harm|cut\s+(?:my\s+)?(?:wrists?|arms?|veins?|myself)|cutting\s+(?:my\s+)?(?:wrists?|arms?|myself)|blade\s+my\s+wrists|slitting|bleed\s+out|hurt\s+myself)\b/i,
  /\b(overdose|sleeping\s+pills|pills\s+to\s+die|too\s+many\s+pills|swallow\s+pills)\b/i,
  /\b(jump\s+off|jump\s+from\s+building|jump\s+in\s+front\s+of\s+train|drown\s+myself|suffocate\s+myself)\b/i,
  /\b(goodbye\s+world|final\s+note|suicide\s+note|sleep\s+forever|never\s+wake\s+up)\b/i,
];

const hindiPatterns = [
  /मरना|मर जाऊं|मर जाऊँ|मरना चाहता|मरना चाहती|मर जाना|मरने/i,
  /मरूंगा|मरूंगी|मरूं|मरूँ|मौत|जान दे/i,
  /जान देना|अपनी जान|खुदकुशी|आत्महत्या|जान खत्म/i,
  /जीना नहीं|जीना नही|नहीं जीना|नही जीना|नही रहना/i,
  /खुद को मार|अपने आप को मार|ज़हर|जहर|फांसी|फंदा/i,
  /नसों को काट|नस काटना|हाथ काटना/i,
];

const hinglishPatterns = [
  /\b(marna|marna\s+hai|mar\s+ja(?:u|oo|un|unga|ungi)|mar\s+jana|marna\s+chahta|marna\s+chahti)\b/i,
  /\b(maru|marun|marunga|marungi|maut|jaan\s+dena)\b/i,
  /\b(main|mai|mein|mujhe|muje)\s+(marna|mar\s+jana|mar\s+jaana|mar\s+jaun|mar\s+jaoon)\b/i,
  /\b(jeena\s+nahi|jeena\s+nhi|nahi\s+jeena|nhi\s+jeena|nahi\s+rahna|nhi\s+rahna)\b/i,
  /\b(apni\s+jaan\s+de(?:na|dunga|dungi)|jaan\s+de\s+d(?:u|oo|unga|ungi))\b/i,
  /\b(khudkushi|aatmahatya|suicide\s+kar(?:na|unga|ungi)?|khud\s+ko\s+maar|khud\s+ko\s+khatam)\b/i,
  /\b(zahar|zahar\s+khana|phaansi|phansi|latak|nas\s+kaat|haath\s+kaat)\b/i,
  /\b(alvida\s+duniya|hamesha\s+k\s+liye\s+so\s+jana)\b/i,
];

const crisisPatterns = [
  ...englishPatterns.map((pattern) => ({ language: "english", pattern })),
  ...hindiPatterns.map((pattern) => ({ language: "hindi", pattern })),
  ...hinglishPatterns.map((pattern) => ({ language: "hinglish", pattern })),
];

const normalizeText = (text = "") =>
  text
    .toString()
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

export const detectCrisis = (text = "") => {
  const normalized = normalizeText(text);

  if (!normalized) {
    return {
      isCrisis: false,
      language: null,
      matchedText: null,
    };
  }

  for (const { language, pattern } of crisisPatterns) {
    const match = normalized.match(pattern);

    if (match) {
      return {
        isCrisis: true,
        language,
        matchedText: match[0],
      };
    }
  }

  return {
    isCrisis: false,
    language: null,
    matchedText: null,
  };
};

export const crisisFallbackReply =
  "I'm really sorry you're feeling this way. You are not alone. If you might hurt yourself or feel in immediate danger, please call your local emergency number now or reach out to someone you trust right away. In India, you can contact KIRAN at 1800-599-0019 for mental health support.";
