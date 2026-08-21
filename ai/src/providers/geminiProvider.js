import genAI from "../services/gemini.js";

function fetchWithTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Model request timed out")), ms)
    ),
  ]);
}

export class GeminiProvider {
  constructor() {
    this.name = "GeminiProvider";
    this.modelsToTry = [
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-2.5-flash",
      "gemini-flash-latest",
    ];
  }

  async generate({ promptText, systemInstruction, maxOutputTokens = 250, temperature = 0.7 }) {
    let lastError = null;

    for (const modelName of this.modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
          generationConfig: {
            maxOutputTokens,
            temperature,
            topP: 0.9,
          },
        });

        const result = await fetchWithTimeout(model.generateContent(promptText), 8000);
        const responseText = result.response?.text();

        if (responseText && responseText.trim()) {
          return { text: responseText.trim(), modelUsed: modelName };
        }
      } catch (err) {
        console.warn(`Gemini model ${modelName} attempt error:`, err.message);
        lastError = err;
      }
    }

    throw new Error(lastError?.message || "Gemini provider failed to generate content.");
  }

  async healthCheck() {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
      const result = await fetchWithTimeout(model.generateContent("ping"), 3000);
      return result.response?.text() ? true : false;
    } catch (err) {
      return false;
    }
  }
}

export default new GeminiProvider();
