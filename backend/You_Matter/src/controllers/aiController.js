import aiOrchestrator from "../services/ai/AiOrchestrator.js";
import circuitBreaker from "../services/ai/CircuitBreaker.js";

/**
 * AI System Health & Observability Controller
 * Provides non-blocking AI status endpoints.
 */
export const getAiHealth = async (req, res) => {
  try {
    const health = await aiOrchestrator.getHealth();
    const httpStatus = health.status === "healthy" ? 200 : 503;

    return res.status(httpStatus).json({
      success: health.success,
      status: health.status,
      provider: health.provider,
      circuitBreakerState: health.circuitBreakerState,
      latencyMs: health.latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({
      success: false,
      status: "degraded",
      provider: "gemini",
      error: { code: "HEALTH_CHECK_FAILED", message: err.message },
    });
  }
};

export const getAiMetrics = async (req, res) => {
  try {
    const cbStatus = circuitBreaker.getStatus();
    return res.status(200).json({
      success: true,
      circuitBreaker: cbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
