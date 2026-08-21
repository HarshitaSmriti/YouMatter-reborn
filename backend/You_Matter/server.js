import http from "http";
import { WebSocketServer } from "ws";
import app from "./src/app.js";
import axios from "axios";
import { detectCrisis, crisisFallbackReply } from "./src/utils/crisisDetector.js";
import { sendCrisisEmail } from "./src/utils/emailService.js";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws/chat" });

wss.on("connection", (ws) => {
  console.log("⚡ WebSocket client connected to AI Chat");

  ws.on("message", async (rawMessage) => {
    try {
      const data = JSON.parse(rawMessage.toString());
      const { message, userId } = data;

      if (!message) return;

      const crisisDetection = detectCrisis(message);
      if (crisisDetection.isCrisis) {
        console.log("🚨 CRISIS DETECTED OVER WEBSOCKET! Message:", message);
        const guardianEmail = process.env.DEFAULT_GUARDIAN_EMAIL || process.env.SMTP_USER;
        if (guardianEmail) {
          sendCrisisEmail(guardianEmail, "YouMatter User", message).catch((e) =>
            console.error("WebSocket Crisis SMTP Error:", e.message)
          );
        }

        ws.send(
          JSON.stringify({
            type: "ai_reply",
            reply: crisisFallbackReply,
            timestamp: Date.now(),
            crisis: true,
          })
        );
        return;
      }

      const aiUrl = process.env.AI_CHAT_URL || "http://localhost:5000/chat";
      const aiResponse = await axios.post(
        aiUrl,
        {
          user_id: userId || "demo-user-123",
          message,
        },
        { timeout: 20000 }
      );

      const reply = aiResponse.data?.reply || "I'm here with you.";

      ws.send(
        JSON.stringify({
          type: "ai_reply",
          reply,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.warn("WebSocket AI error:", err.message);
      ws.send(
        JSON.stringify({
          type: "ai_reply",
          reply:
            "I'm here with you and listening. How can I support you right now?",
          timestamp: Date.now(),
        })
      );
    }
  });

  ws.on("close", () => console.log("WebSocket client disconnected"));
});

server.listen(PORT, () => {
  console.log(`Server & WebSockets running on port ${PORT}`);
});