import providerManager from "./ProviderManager.js";
import usageTracker from "./UsageTracker.js";
import circuitBreaker from "./CircuitBreaker.js";

/**
 * AI Orchestrator Layer
 * Centralized gateway for AI chat execution, stream forwarding, requestId tracing,
 * server-side rate limits, and structured error responses.
 */
export class AiOrchestrator {
  generateRequestId() {
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).substring(2, 8);
    return `AI-${timestamp}-${rand}`;
  }

  async processMessage(req, message, userData) {
    const requestId = this.generateRequestId();

    // 1. Check Server-Side Guest Limit
    const quotaCheck = usageTracker.checkGuestLimit(req);
    if (!quotaCheck.allowed) {
      const err = new Error(quotaCheck.message);
      err.code = "AI_USAGE_LIMIT";
      err.status = 429;
      err.requestId = requestId;
      throw err;
    }

    // 2. Check Circuit Breaker State
    if (!circuitBreaker.canExecute()) {
      const err = new Error("AI service is temporarily unavailable due to high system load. Please try again shortly.");
      err.code = "AI_UNAVAILABLE";
      err.status = 503;
      err.requestId = requestId;
      throw err;
    }

    const consent = {
      user_name: userData?.full_name || req.user?.user_metadata?.full_name || "User",
      guardian_name: userData?.guardian_name || "Guardian",
      guardian_email: userData?.guardian_email || "",
    };

    try {
      const result = await providerManager.execute({
        user_id: req.user.id,
        message,
        consent,
        requestId,
      });

      // Record successful usage
      usageTracker.recordGuestUsage(req);
      usageTracker.trackUserUsage(req.user.id, message.length / 4, (result.reply || "").length / 4);

      return {
        success: true,
        reply: result.reply,
        requestId,
        latencyMs: result.latencyMs,
        provider: result.provider,
      };
    } catch (error) {
      console.error(`[AiOrchestrator] Error processing request ${requestId}:`, error.message);
      throw {
        success: false,
        error: {
          code: error.code || "AI_PROVIDER_ERROR",
          message: error.message || "An error occurred while connecting to the AI companion.",
        },
        requestId,
        status: error.status || (error.code === "AI_TIMEOUT" ? 504 : 500),
      };
    }
  }

  async getHealth() {
    return await providerManager.getHealthStatus();
  }
}

export default new AiOrchestrator();
