import express from "express";
import cors from "cors";
import helmet from "helmet";

import chatRouter from "./routes/chat.js";
import geminiProvider from "./providers/geminiProvider.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "5mb" }));

app.get("/health", (req, res) => {
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

app.use("/chat", chatRouter);

export default app;