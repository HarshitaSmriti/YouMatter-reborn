import express from "express";
import { processMessage, processMessageStream } from "../orchestrator/conversationManager.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, user_id, message } = req.body;
    const activeUserId = userId || user_id || "anonymous";
    const isStream = req.query.stream === "true" || req.headers.accept === "text/event-stream";

    if (isStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const response = await processMessageStream(activeUserId, message, (chunkText) => {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      });

      res.write(`data: [DONE]\n\n`);
      return res.end();
    }

    const response = await processMessage(activeUserId, message);
    res.json(response);
  } catch (err) {
    console.error("[AI Chat Route Error]:", err.message || err);

    const isQuota = err.code === "AI_QUOTA_EXHAUSTED" || err.status === 429;
    const statusCode = err.status || (isQuota ? 429 : 500);
    const userMessage = isQuota
      ? "AI quota is currently exhausted. Please try again later."
      : "I'm having trouble responding right now. Please try again in a moment.";

    if (req.headers.accept === "text/event-stream" || req.query.stream === "true") {
      res.write(`data: ${JSON.stringify({ error: userMessage, code: err.code || "AI_ERROR" })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    }

    res.status(statusCode).json({
      success: false,
      reply: userMessage,
      error: err.code || "AI_ERROR",
    });
  }
});

export default router;