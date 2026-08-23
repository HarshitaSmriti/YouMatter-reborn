import express from "express";
import cors from "cors";
import helmet from "helmet";

import chatRouter from "./routes/chat.js";
import geminiProvider from "./providers/geminiProvider.js";

const app = express();

// Dedicated Zero-Body Cron Endpoint — Placed at the absolute top of Express stack
// Handles GET, HEAD, OPTIONS requests immediately with HTTP 204 No Content (Content-Length: 0)
// guaranteeing zero response body and bypassing all middleware, CORS preflights, and AI processing.
app.all("/cron-health", (req, res) => {
  res.setHeader("Content-Length", "0");
  res.status(204).end();
});

// Existing Lightweight Keep-Alive Endpoint
app.get("/health", (req, res) => {
  console.log("[HEALTH] OK");
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send("OK");
});

app.get("/health/live", (req, res) => {
  res.status(200).json({ status: "alive" });
});

app.get("/health/ready", async (req, res) => {
  const providerOk = await geminiProvider.healthCheck();
  if (providerOk) {
    res.status(200).json({ status: "ready", aiProvider: "connected" });
  } else {
    res.status(503).json({ status: "unready", aiProvider: "degraded" });
  }
});

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "5mb" }));

app.use("/chat", chatRouter);

export default app;