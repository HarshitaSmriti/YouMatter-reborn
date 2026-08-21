import express from "express";
import { processMessage } from "../orchestrator/conversationManager.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, user_id, message } = req.body;
    const activeUserId = userId || user_id || "anonymous";

    const response = await processMessage(activeUserId, message);

    res.json(response);
  } catch (err) {
    console.error("AI Route Error:", err);

    res.status(500).json({
      success: false,
      reply: "I'm having trouble responding right now. Please try again in a moment.",
      error: err.message,
    });
  }
});

export default router;