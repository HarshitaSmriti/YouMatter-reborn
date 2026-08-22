import axios from "axios";
import circuitBreaker from "./CircuitBreaker.js";

/**
 * Provider Manager
 * Abstracts external AI execution, enforces timeouts, handles circuit breaking,
 * and records latency metrics without crashing Node.js.
 */
export class ProviderManager {
  constructor() {
    this.primaryProvider = process.env.AI_PRIMARY_PROVIDER || "gemini";
    this.fallbackProvider = process.env.AI_FALLBACK_PROVIDER || "";
    this.aiTimeoutMs = parseInt(process.env.AI_REQUEST_TIMEOUT_MS || "45000", 10);
    this.lastLatencyMs = 0;
  }

  getAiServiceUrl() {
    const rawUrl = process.env.AI_CHAT_URL || "https://youmatter-reborn-1.onrender.com/chat";
    let cleanUrl = rawUrl.trim().replace(/\/+$/, "");
    if (!cleanUrl.endsWith("/chat")) {
      cleanUrl += "/chat";
    }
    return cleanUrl;
  }

  async execute({ user_id, message, consent, requestId }) {
    if (!circuitBreaker.canExecute()) {
      const err = new Error("AI service is temporarily unavailable due to high error rates. Please try again shortly.");
      err.code = "AI_UNAVAILABLE";
      throw err;
    }

    const startTime = Date.now();
    const aiUrl = this.getAiServiceUrl();

    console.log(`[AI] Resolved AI URL: ${aiUrl}`);
    console.log(`[AI] Sending request to AI service (requestId=${requestId})`);

    try {
      const response = await axios.post(
        aiUrl,
        {
          user_id,
          userId: user_id,
          message,
          consent,
          requestId,
        },
        {
          timeout: this.aiTimeoutMs,
          headers: { "Content-Type": "application/json", "X-Request-Id": requestId },
        }
      );

      this.lastLatencyMs = Date.now() - startTime;
      circuitBreaker.recordSuccess();

      console.log(`[AI] AI response status: ${response.status}`);
      console.log(`[AI] AI response content-type: ${response.headers["content-type"] || "unknown"}`);

      const reply =
        response.data?.reply ||
        response.data?.response ||
        response.data?.output ||
        response.data?.text ||
        response.data?.message;

      if (reply) {
        return {
          success: true,
          reply,
          provider: this.primaryProvider,
          latencyMs: this.lastLatencyMs,
        };
      }

      throw new Error("AI provider returned empty response body.");
    } catch (error) {
      this.lastLatencyMs = Date.now() - startTime;
      circuitBreaker.recordFailure(error);

      const status = error.response?.status || (error.code === "ECONNABORTED" ? 504 : 502);
      console.warn(`[AI] AI request failed: status=${status}, message=${error.message}`);
      
      const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
      const customErr = new Error(isTimeout ? "AI response timed out." : error.message || "AI provider communication error.");
      customErr.code = isTimeout ? "AI_TIMEOUT" : "AI_PROVIDER_ERROR";
      customErr.originalError = error;
      throw customErr;
    }
  }

  async getHealthStatus() {
    const startTime = Date.now();
    const aiUrl = this.getAiServiceUrl();
    const cbStatus = circuitBreaker.getStatus();

    if (cbStatus.state === "OPEN") {
      return {
        success: false,
        status: "degraded",
        provider: this.primaryProvider,
        circuitBreakerState: cbStatus.state,
        latencyMs: 0,
        message: "Circuit breaker is OPEN. Upstream requests are temporarily paused.",
      };
    }

    try {
      const pingUrl = aiUrl.replace(/\/chat$/, "/health") || aiUrl;
      const res = await axios.get(pingUrl, { timeout: 5000 }).catch(() => null);
      const latencyMs = Date.now() - startTime;

      const isHealthy = res?.status === 200;
      return {
        success: isHealthy,
        status: isHealthy ? "healthy" : "degraded",
        provider: this.primaryProvider,
        circuitBreakerState: cbStatus.state,
        latencyMs,
      };
    } catch (err) {
      return {
        success: false,
        status: "degraded",
        provider: this.primaryProvider,
        circuitBreakerState: cbStatus.state,
        latencyMs: Date.now() - startTime,
      };
    }
  }
}

export default new ProviderManager();
