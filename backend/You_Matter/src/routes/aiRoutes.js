import express from "express";
import { getAiHealth, getAiMetrics } from "../controllers/aiController.js";

const router = express.Router();

// GET /api/v1/ai/health
router.get("/health", getAiHealth);

// GET /api/v1/ai/metrics
router.get("/metrics", getAiMetrics);

export default router;
