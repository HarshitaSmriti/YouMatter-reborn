import ai from "../services/gemini.js";

function fetchWithTimeout(promise, ms = 15000) {
  let timer = null;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error("AI_TIMEOUT");
      err.isTimeout = true;
      reject(err);
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function isQuotaError(err) {
  const msg = (err?.message || "").toLowerCase();
  const status = err?.status || err?.response?.status;
  return (
    status === 429 ||
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota exceeded") ||
    msg.includes("exceeded your current quota")
  );
}

function isAuthError(err) {
  const msg = (err?.message || "").toLowerCase();
  const status = err?.status || err?.response?.status;
  return (
    status === 401 ||
    status === 403 ||
    msg.includes("api key") ||
    msg.includes("unauthorized") ||
    msg.includes("forbidden")
  );
}

function isNotFoundError(err) {
  const msg = (err?.message || "").toLowerCase();
  const status = err?.status || err?.response?.status;
  return (
    status === 404 ||
    msg.includes("404") ||
    msg.includes("not_found") ||
    msg.includes("no longer available")
  );
}

export class GeminiProvider {
  constructor() {
    this.name = "GeminiProvider";
  }

  getModelsToTry() {
    const envModel = (process.env.GEMINI_MODEL || "").trim();
    const defaults = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"];
    const models = [];
    if (envModel) {
      models.push(envModel);
    }
    for (const m of defaults) {
      if (!models.includes(m)) {
        models.push(m);
      }
    }
    return models;
  }

  async generate({ promptText, systemInstruction, maxOutputTokens = 700 }) {
    const timeoutMs = parseInt(process.env.AI_TIMEOUT_MS || "15000", 10);
    const models = this.getModelsToTry();
    let lastError = null;

    console.log(`[AI] Request started - model chain: ${models.join(", ")}`);

    for (const modelName of models) {
      try {
        console.log(`[AI] Model: ${modelName}`);
        const response = await fetchWithTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: promptText,
            config: {
              systemInstruction,
              maxOutputTokens,
            },
          }),
          timeoutMs
        );

        const responseText = response?.text;
        if (responseText && responseText.trim()) {
          console.log(`[AI] Gemini response received via ${modelName}`);
          return { text: responseText.trim(), modelUsed: modelName };
        }
      } catch (err) {
        lastError = err;

        if (isQuotaError(err)) {
          console.error(`[AI] Gemini quota exhausted (429) on model ${modelName}. Short-circuiting retry chain.`);
          const quotaErr = new Error("AI provider quota exhausted. Please try again later.");
          quotaErr.code = "AI_QUOTA_EXHAUSTED";
          quotaErr.status = 429;
          throw quotaErr;
        }

        if (isAuthError(err)) {
          console.error(`[AI] Gemini authentication error (401/403) on model ${modelName}.`);
          const authErr = new Error("AI provider authentication failed.");
          authErr.code = "AI_AUTH_ERROR";
          authErr.status = 401;
          throw authErr;
        }

        if (isNotFoundError(err)) {
          console.warn(`[AI] Gemini model unavailable (404): ${modelName}. Trying fallback...`);
          continue;
        }

        if (err.isTimeout) {
          console.warn(`[AI] Gemini timeout (${timeoutMs}ms) on model ${modelName}.`);
          continue;
        }

        console.warn(`[AI] Gemini model ${modelName} error:`, err.message);
      }
    }

    throw new Error(lastError?.message || "Gemini provider failed to generate content.");
  }

  async generateStream({ promptText, systemInstruction, maxOutputTokens = 700, onChunk }) {
    const timeoutMs = parseInt(process.env.AI_TIMEOUT_MS || "15000", 10);
    const models = this.getModelsToTry();
    let lastError = null;

    console.log(`[AI] Stream request started - model chain: ${models.join(", ")}`);

    for (const modelName of models) {
      try {
        console.log(`[AI] Model: ${modelName}`);
        const responseStream = await fetchWithTimeout(
          ai.models.generateContentStream({
            model: modelName,
            contents: promptText,
            config: {
              systemInstruction,
              maxOutputTokens,
            },
          }),
          timeoutMs
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
          console.log(`[AI] Gemini stream response completed via ${modelName}`);
          return { text: fullText.trim(), modelUsed: modelName };
        }
      } catch (err) {
        lastError = err;

        if (isQuotaError(err)) {
          console.error(`[AI] Gemini quota exhausted (429) on model ${modelName}. Short-circuiting retry chain.`);
          const quotaErr = new Error("AI provider quota exhausted. Please try again later.");
          quotaErr.code = "AI_QUOTA_EXHAUSTED";
          quotaErr.status = 429;
          throw quotaErr;
        }

        if (isAuthError(err)) {
          console.error(`[AI] Gemini authentication error (401/403) on model ${modelName}.`);
          const authErr = new Error("AI provider authentication failed.");
          authErr.code = "AI_AUTH_ERROR";
          authErr.status = 401;
          throw authErr;
        }

        if (isNotFoundError(err)) {
          console.warn(`[AI] Gemini model unavailable (404): ${modelName}. Trying fallback...`);
          continue;
        }

        if (err.isTimeout) {
          console.warn(`[AI] Gemini stream timeout (${timeoutMs}ms) on model ${modelName}.`);
          continue;
        }

        console.warn(`[AI] Gemini stream model ${modelName} error:`, err.message);
      }
    }

    throw new Error(lastError?.message || "Gemini provider failed to generate stream content.");
  }

  async healthCheck() {
    const models = this.getModelsToTry();
    const primaryModel = models[0] || "gemini-2.5-flash";
    try {
      const response = await fetchWithTimeout(
        ai.models.generateContent({
          model: primaryModel,
          contents: "ping",
        }),
        5000
      );
      return response?.text ? true : false;
    } catch (err) {
      return false;
    }
  }
}

export default new GeminiProvider();
