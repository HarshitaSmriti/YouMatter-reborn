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
    console.error("AI Route Error:", err);

    if (req.headers.accept === "text/event-stream" || req.query.stream === "true") {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    }

    res.status(500).json({
      success: false,
      reply: "I'm having trouble responding right now. Please try again in a moment.",
      error: err.message,
    });
  }
});

export default router;