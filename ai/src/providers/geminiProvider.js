import ai from "../services/gemini.js";

function fetchWithTimeout(promise, ms = 20000) {
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
      "gemini-3.6-flash",
      "gemini-3.7-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash-exp",
    ];
  }

  async generate({ promptText, systemInstruction, maxOutputTokens = 1000 }) {
    let lastError = null;

    for (const modelName of this.modelsToTry) {
      try {
        const response = await fetchWithTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: promptText,
            config: {
              systemInstruction,
              maxOutputTokens,
            },
          }),
          20000
        );

        const responseText = response?.text;

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

  async generateStream({ promptText, systemInstruction, maxOutputTokens = 1000, onChunk }) {
    let lastError = null;

    for (const modelName of this.modelsToTry) {
      try {
        const responseStream = await fetchWithTimeout(
          ai.models.generateContentStream({
            model: modelName,
            contents: promptText,
            config: {
              systemInstruction,
              maxOutputTokens,
            },
          }),
          20000
        );

        let fullText = "";
        for await (const chunk of responseStream) {
          const chunkText = chunk.text;
          if (chunkText) {
            fullText += chunkText;
            if (onChunk) onChunk(chunkText);
          }
        }

        if (fullText && fullText.trim()) {
          return { text: fullText.trim(), modelUsed: modelName };
        }
      } catch (err) {
        console.warn(`Gemini stream model ${modelName} attempt error:`, err.message);
        lastError = err;
      }
    }

    throw new Error(lastError?.message || "Gemini provider failed to generate stream content.");
  }

  async healthCheck() {
    try {
      const response = await fetchWithTimeout(
        ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: "ping",
        }),
        10000
      );
      return response?.text ? true : false;
    } catch (err) {
      return false;
    }
  }
}

export default new GeminiProvider();
