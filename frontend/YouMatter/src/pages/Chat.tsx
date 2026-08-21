import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../config/api";
import { useMood } from "../context/MoodContext";
import {
  Sparkles,
  Send,
  ArrowLeft,
  History,
  Plus,
  ChevronRight,
  X,
  MessageCircle,
  Clock,
  Trash2,
} from "lucide-react";

interface Message {
  sender: string;
  message?: string;
  text?: string;
  timestamp?: number;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

function getActiveUserId(): string {
  try {
    const name = localStorage.getItem("userName");
    if (name) return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const token = localStorage.getItem("token");
    if (token) {
      const payloadBase64 = token.split(".")[1];
      if (payloadBase64) {
        const decoded = JSON.parse(atob(payloadBase64));
        if (decoded.sub) return decoded.sub;
      }
    }
  } catch (err) {
    console.warn("Unable to parse user identifier:", err);
  }
  return "guest";
}

function getUserSessionKey(userId: string): string {
  return `youmatter_${userId}_chatsessions`;
}
function getUserCurrentKey(userId: string): string {
  return `youmatter_${userId}_currentsession_id`;
}

function generateSessionId(): string {
  return "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yest = new Date();
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Chat() {
  const navigate = useNavigate();
  const { theme } = useMood();
  const userId = getActiveUserId();

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return (userId && localStorage.getItem(getUserCurrentKey(userId))) || generateSessionId();
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(getUserSessionKey(userId));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewingSession, setViewingSession] = useState<ChatSession | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const envWs = import.meta.env.VITE_WS_URL;
    if (!envWs) {
      // Use clean HTTP REST mode when no explicit WebSocket URL is configured
      return;
    }

    const ws = new WebSocket(envWs);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("⚡ Real-time WebSocket AI connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ai_reply" && data.reply) {
          const aiMessage: Message = { sender: "ai", text: data.reply, timestamp: Date.now() };
          setMessages((prev) => [...prev, aiMessage]);
          setIsLoading(false);
        }
      } catch (e) {
        console.warn("WebSocket parse error:", e);
      }
    };

    ws.onerror = (err) => {
      console.warn("WebSocket fallback mode", err);
    };

    return () => {
      ws.close();
    };
  }, []);

  const prompts = [
    "I'm feeling overwhelmed today",
    "Help me process anxiety",
    "I need someone to talk to",
    "Guide me through a tough day",
  ];

  useEffect(() => {
    const loadBackendHistory = async () => {
      try {
        const res = await api.get("/conversation");
        const historyData = res.data?.data;
        if (Array.isArray(historyData) && historyData.length > 0) {
          const parsed = historyData.map((item: any) => ({
            sender: item.sender || "ai",
            text: item.message || item.text || "",
            timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
          }));
          setMessages(parsed);
          setHasInteracted(true);
        }
      } catch (err) {
        console.warn("Backend conversation fetch notice:", err);
      }
    };
    loadBackendHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const persistSession = (msgsToSave: Message[]) => {
    if (!userId || msgsToSave.length === 0) return;
    const firstUserMsg = msgsToSave.find((m) => (m.sender || "").toLowerCase() === "user");
    const rawTitle = firstUserMsg ? firstUserMsg.message || firstUserMsg.text || "Chat Session" : "Chat Session";
    const title = rawTitle.length > 32 ? rawTitle.substring(0, 32) + "..." : rawTitle;
    const timestamp = msgsToSave[0]?.timestamp || Date.now();

    const newSession: ChatSession = {
      id: currentSessionId,
      title,
      timestamp,
      messages: msgsToSave,
    };

    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === currentSessionId);
      let updated: ChatSession[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = newSession;
      } else {
        updated = [newSession, ...prev];
      }
      try {
        localStorage.setItem(getUserSessionKey(userId), JSON.stringify(updated.slice(0, 30)));
      } catch (e) {
        console.warn("Unable to save session history:", e);
      }
      return updated;
    });

    try {
      localStorage.setItem(getUserCurrentKey(userId), currentSessionId);
    } catch (e) {
      console.warn("Unable to save current session id:", e);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      persistSession(messages);
    }
  }, [messages]);

  const sendMessage = async (textToSend?: string) => {
    const content = (textToSend || message).trim();
    if (!content || isLoading) return;

    setMessage("");
    setHasInteracted(true);
    if (viewingSession) setViewingSession(null);

    const userMessage: Message = { sender: "user", message: content, text: content, timestamp: Date.now() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          userId: userId || "guest",
          message: content,
        })
      );
      return;
    }

    try {
      const res = await api.post("/message", {
        message: content,
        history: updatedMessages.slice(-8).map((m) => ({
          role: (m.sender || "").toLowerCase() === "user" ? "user" : "model",
          text: m.message || m.text || "",
        })),
      });

      const reply = res.data?.reply || res.data?.message || "I'm right here with you.";
      const aiMessage: Message = { sender: "ai", message: reply, text: reply, timestamp: Date.now() };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("Chat API error:", err);
      const fallbackMsg: Message = {
        sender: "ai",
        text: "I'm right here with you. I might be experiencing a brief delay, but please know you're not alone.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async () => {
    persistSession(messages);
    const newId = generateSessionId();
    setCurrentSessionId(newId);
    if (userId) localStorage.setItem(getUserCurrentKey(userId), newId);
    setMessages([]);
    setHasInteracted(false);
    setViewingSession(null);
    setHistoryOpen(false);
    try {
      await api.post("/conversation/new", {});
    } catch (err) {
      console.warn("Unable to start a new backend conversation", err);
    }
  };

  const clearChatHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your chat history?")) return;
    setMessages([]);
    setHasInteracted(false);
    setViewingSession(null);
    if (userId) {
      localStorage.removeItem(getUserSessionKey(userId));
    }
    setSessions((prev) => prev.filter((s) => s.id !== currentSessionId));
    try {
      await api.delete("/conversation/clear");
    } catch (err) {
      console.warn("Cleared locally:", err);
    }
  };

  const loadSession = (session: ChatSession) => {
    setViewingSession(session);
    setHistoryOpen(false);
  };

  const exitSessionView = () => setViewingSession(null);

  const displayMessages = viewingSession ? viewingSession.messages : messages;

  return (
    <div
      className="flex h-screen flex-col lg:flex-row overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: theme.pageBg }}
    >
      {/* SIDEBAR */}
      <Sidebar />

      {/* HISTORY DRAWER */}
      <div
        className={`fixed inset-y-0 right-0 z-30 flex flex-col border-l shadow-2xl transition-transform duration-300 ease-in-out ${
          historyOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "min(320px, 90vw)", backgroundColor: theme.cardBg, borderColor: theme.border }}
      >
        <div className="flex items-center justify-between border-b p-4" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <History size={18} style={{ color: theme.accent }} />
            <h2 className="font-bold text-base" style={{ color: theme.text }}>Chat History</h2>
          </div>
          <button
            onClick={() => setHistoryOpen(false)}
            className="rounded-xl p-1 transition hover:opacity-80"
            style={{ color: theme.subtext }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={startNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-2xl p-3 text-sm font-bold text-white transition hover:opacity-90 shadow-xs"
            style={{ backgroundColor: theme.accent }}
          >
            <Plus size={16} />
            Start New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-2">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle size={32} className="opacity-30 mb-2" style={{ color: theme.accent }} />
              <p className="text-xs font-semibold" style={{ color: theme.subtext }}>No past sessions yet</p>
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => loadSession(session)}
                className="group flex w-full items-start gap-3 rounded-2xl p-3 text-left transition border"
                style={{
                  backgroundColor: viewingSession?.id === session.id ? theme.soft : theme.cardBg,
                  borderColor: viewingSession?.id === session.id ? theme.accent : theme.border,
                }}
              >
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: theme.accent + "22" }}
                >
                  <Sparkles size={14} style={{ color: theme.accent }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold" style={{ color: theme.text }}>
                    {session.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1 text-xs" style={{ color: theme.subtext }}>
                    <Clock size={11} />
                    <span>{formatDate(session.timestamp)}</span>
                    <span>·</span>
                    <span>{session.messages.length} msgs</span>
                  </div>
                </div>
                <ChevronRight size={14} className="mt-1.5 shrink-0 transition" style={{ color: theme.subtext }} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Backdrop */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={() => setHistoryOpen(false)}
        />
      )}

      {/* MAIN */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* TOPBAR */}
        <div
          className="border-b px-4 py-3 backdrop-blur-md sm:px-6 transition-colors duration-500"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <div className="flex items-center justify-between gap-3">
            {/* LEFT */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => navigate("/home")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-xs transition hover:opacity-80 active:scale-95"
                style={{ backgroundColor: theme.soft, borderColor: theme.border }}
              >
                <ArrowLeft size={18} style={{ color: theme.accent }} />
              </button>

              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.accent + "22" }}
              >
                <Sparkles size={20} style={{ color: theme.accent }} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-base font-black sm:text-xl leading-tight" style={{ color: theme.text }}>
                  YouMatter AI
                </h1>
                <p className="text-[11px] font-semibold" style={{ color: theme.subtext }}>Calm · Supportive · Safe</p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={clearChatHistory}
                title="Clear Chat History"
                className="flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95 shadow-xs"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Clear Chat</span>
              </button>

              <button
                onClick={startNewChat}
                className="flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition hover:opacity-90 active:scale-95 shadow-xs"
                style={{ backgroundColor: theme.soft, borderColor: theme.border, color: theme.text }}
              >
                <Plus size={14} />
                <span className="hidden sm:inline">New Chat</span>
              </button>

              <button
                onClick={() => setHistoryOpen(true)}
                className="relative flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition hover:opacity-90 active:scale-95 shadow-xs"
                style={{ backgroundColor: theme.soft, borderColor: theme.border, color: theme.text }}
              >
                <History size={14} />
                <span className="hidden sm:inline">History</span>
                {sessions.length > 0 && (
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {sessions.length > 9 ? "9+" : sessions.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Viewing old session banner */}
          {viewingSession && (
            <div
              className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-2 border"
              style={{ backgroundColor: theme.soft, borderColor: theme.border }}
            >
              <div className="flex items-center gap-2">
                <History size={13} style={{ color: theme.accent }} className="shrink-0" />
                <span className="text-xs font-bold truncate max-w-[180px] sm:max-w-none" style={{ color: theme.text }}>
                  Viewing: "{viewingSession.title}"
                </span>
              </div>
              <button
                onClick={exitSessionView}
                className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-bold transition hover:opacity-80"
                style={{ color: theme.accent }}
              >
                Back to current <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* CHAT AREA */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* MESSAGES */}
          <div className="relative flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              {/* EMPTY STATE */}
              {displayMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    className="flex h-18 w-18 items-center justify-center rounded-[20px] p-5 shadow-lg"
                    style={{ backgroundColor: theme.accent + "22" }}
                  >
                    <Sparkles size={32} style={{ color: theme.accent }} />
                  </div>
                  <h2 className="mt-5 text-xl font-black sm:text-3xl leading-tight" style={{ color: theme.text }}>
                    Start a Safe Conversation
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-7 font-medium" style={{ color: theme.subtext }}>
                    Share your thoughts freely in a calm, supportive and judgment-free space.
                  </p>
                </div>
              )}

              {/* MESSAGES */}
              {displayMessages.map((msg, index) => {
                const isUser = (msg.sender || "").toLowerCase() === "user";
                const content = msg.message || msg.text || "";
                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    style={{ animation: "fadeUp 0.2s ease-out" }}
                  >
                    {!isUser ? (
                      <div className="flex max-w-[90%] items-start gap-2 sm:max-w-[75%]">
                        <div
                          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: theme.accent + "22" }}
                        >
                          <Sparkles size={13} style={{ color: theme.accent }} />
                        </div>
                        <div
                          className="rounded-[20px] rounded-tl-sm p-4 border shadow-sm transition-all"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                        >
                          <p className="text-sm leading-7 sm:text-[15px] whitespace-pre-wrap font-medium">
                            {content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="max-w-[90%] rounded-[20px] rounded-tr-sm px-4 py-3 font-semibold shadow-md sm:max-w-[75%]"
                        style={{ backgroundColor: theme.accent, color: "#ffffff" }}
                      >
                        <p className="text-sm leading-7 sm:text-[15px] whitespace-pre-wrap">
                          {content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* TYPING INDICATOR */}
              {isLoading && (
                <div className="flex justify-start" style={{ animation: "fadeUp 0.2s ease-out" }}>
                  <div className="flex items-start gap-2">
                    <div
                      className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: theme.accent + "22" }}
                    >
                      <Sparkles size={13} style={{ color: theme.accent }} />
                    </div>
                    <div
                      className="rounded-[20px] rounded-tl-sm p-4 border shadow-sm"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                    >
                      <div className="flex items-center gap-1.5">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: theme.accent,
                              animation: `typingBounce 1.2s ${delay}ms infinite`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* INPUT SECTION */}
          {!viewingSession && (
            <div
              className="border-t px-4 py-4 backdrop-blur-md sm:px-6 transition-colors duration-500"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            >
              <div className="mx-auto max-w-2xl">
                {/* PROMPTS — shown only before first message */}
                {!hasInteracted && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {prompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(prompt)}
                        className="rounded-full border px-3 py-1.5 text-xs font-bold transition hover:opacity-90 active:scale-[0.97]"
                        style={{ backgroundColor: theme.soft, borderColor: theme.border, color: theme.accent }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* INPUT BAR */}
                <div
                  className="flex items-end gap-2 rounded-[22px] border p-3 shadow-xs transition-all"
                  style={{ backgroundColor: theme.soft, borderColor: theme.border }}
                >
                  <textarea
                    rows={1}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message… (Enter to send)"
                    className="flex-1 resize-none bg-transparent text-sm outline-none font-medium leading-6"
                    style={{ maxHeight: "120px", color: theme.text }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!message.trim() || isLoading}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition hover:opacity-90 active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Send size={15} className="text-white" />
                  </button>
                </div>

                <p className="mt-2 text-center text-[10px] font-medium" style={{ color: theme.subtext }}>
                  YouMatter AI listens — not a replacement for professional help.
                </p>
              </div>
            </div>
          )}

          {/* READ-ONLY BANNER */}
          {viewingSession && (
            <div
              className="border-t px-4 py-3 sm:px-6 transition-colors duration-500"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            >
              <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-3">
                <p className="text-sm font-medium" style={{ color: theme.subtext }}>
                  This is a past conversation — read only.
                </p>
                <button
                  onClick={exitSessionView}
                  className="rounded-2xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ backgroundColor: theme.accent }}
                >
                  Return to current chat
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
