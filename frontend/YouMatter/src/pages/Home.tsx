import { useState, useEffect, useRef } from "react";
import MoodSection from "../components/MoodSection";
import Sidebar from "../components/Sidebar";
import {
  MessageCircle,
  BookOpen,
  Activity,
  Wind,
  HeartHandshake,
  Sparkles,
  ArrowRight,
  Smile,
  Leaf,
  Minus,
  Zap,
  CloudRain,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import supabase from "../config/supabaseClient";
import { useMood } from "../context/MoodContext";

// ─── Mood Config ───────────────────────────────────────────────────────────────
const MOOD_CONFIG: Record<
  string,
  {
    Icon: any;
    label: string;
    bg: string;
    card: string;
    accent: string;
    text: string;
    soft: string;
    orb1: string;
    orb2: string;
    quote: string;
    graphColor: string;
    graphBg: string;
  }
> = {
  happy: {
    Icon: Smile,
    label: "Happy",
    bg: "from-[#fffdf0] via-[#fff8e6] to-[#ffefd5]",
    card: "bg-[#fff8e6]",
    accent: "#f59e0b",
    text: "#78350f",
    soft: "#fef3c7",
    orb1: "#fde68a",
    orb2: "#fcd34d",
    quote: "Keep shining! Your joy radiates around you.",
    graphColor: "#f59e0b",
    graphBg: "#fff8e6",
  },
  calm: {
    Icon: Leaf,
    label: "Calm",
    bg: "from-[#f0fdf4] via-[#e6f4ea] to-[#dcfce7]",
    card: "bg-[#e6f4ea]",
    accent: "#10b981",
    text: "#065f46",
    soft: "#d1fae5",
    orb1: "#a7f3d0",
    orb2: "#6ee7b7",
    quote: "Peace comes from within. Take a gentle breath.",
    graphColor: "#10b981",
    graphBg: "#e6f4ea",
  },
  sad: {
    Icon: CloudRain,
    label: "Sad",
    bg: "from-[#eff6ff] to-[#dbeafe]",
    card: "bg-[#dbeafe]",
    accent: "#3b82f6",
    text: "#1e3a8a",
    soft: "#bfdbfe",
    orb1: "#93c5fd",
    orb2: "#60a5fa",
    quote: "Tears are okay. Healing is on its way.",
    graphColor: "#3b82f6",
    graphBg: "#dbeafe",
  },
  anxious: {
    Icon: Zap,
    label: "Anxious",
    bg: "from-[#fdf4ff] to-[#fae8ff]",
    card: "bg-[#fae8ff]",
    accent: "#a855f7",
    text: "#581c87",
    soft: "#e9d5ff",
    orb1: "#d8b4fe",
    orb2: "#c084fc",
    quote: "Breathe in… breathe out. You are safe here.",
    graphColor: "#a855f7",
    graphBg: "#fae8ff",
  },
  angry: {
    Icon: Flame,
    label: "Angry",
    bg: "from-[#fff7f5] to-[#ffe4de]",
    card: "bg-[#ffe4de]",
    accent: "#ef4444",
    text: "#7f1d1d",
    soft: "#fecaca",
    orb1: "#fca5a5",
    orb2: "#f87171",
    quote: "Your feelings are valid. Let it out safely.",
    graphColor: "#ef4444",
    graphBg: "#ffe4de",
  },
  neutral: {
    Icon: Minus,
    label: "Neutral",
    bg: "from-[#fcfbff] to-[#f3f0ff]",
    card: "bg-[#f2ebff]",
    accent: "#8a6dff",
    text: "#3b2a8a",
    soft: "#ede9fe",
    orb1: "#c4b5fd",
    orb2: "#a78bfa",
    quote: "Every day is a fresh start. You're doing great.",
    graphColor: "#8a6dff",
    graphBg: "#f2ebff",
  },
};

// ─── Mini Mood Graph ───────────────────────────────────────────────────────────
interface MoodEntry {
  mood: string;
  time: string;
  value: number;
}

const MOOD_VALUES: Record<string, number> = {
  happy: 5,
  calm: 4,
  neutral: 3,
  anxious: 2,
  sad: 1,
  angry: 1,
};

// Maps mood key → lucide icon letter label for SVG (icons can't render in SVG)
const MOOD_INITIALS: Record<string, string> = {
  happy: "H",
  calm: "C",
  sad: "S",
  anxious: "A",
  angry: "!",
  neutral: "–",
};

function MoodGraph({
  entries,
  color,
  bg,
}: {
  entries: MoodEntry[];
  color: string;
  bg: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 340;
  const H = 100;
  const PAD = 16;

  if (entries.length < 2) {
    return (
      <div
        className="flex h-[120px] items-center justify-center rounded-2xl"
        style={{ background: bg }}
      >
        <p className="text-center text-sm leading-6" style={{ color }}>
          Log more moods to<br />see your trend
        </p>
      </div>
    );
  }

  const vals = entries.map((e) => e.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const pts = entries.map((e, i) => {
    const x = PAD + (i / (entries.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((e.value - minV) / range) * (H - PAD * 2);
    return { x, y, ...e };
  });

  const pathD = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cpX = (prev.x + p.x) / 2;
      return `C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  const areaD =
    pathD +
    ` L ${pts[pts.length - 1].x} ${H - PAD} L ${pts[0].x} ${H - PAD} Z`;

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: bg }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#moodGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} opacity="0.85" />
        ))}
        {/* Letter labels instead of emoji (SVG doesn't render lucide) */}
        {pts.map((p, i) => (
          <text
            key={`l${i}`}
            x={p.x}
            y={p.y - 9}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={color}
            opacity="0.75"
          >
            {MOOD_INITIALS[p.mood] ?? "•"}
          </text>
        ))}
      </svg>
      <div className="flex justify-between px-4 pb-2">
        {entries.map((e, i) => (
          <span key={i} className="text-[10px] opacity-60" style={{ color }}>
            {e.time}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const { activeMood, setMood, theme } = useMood();
  const [userName, setUserName] = useState<string>(() => {
    return (
      localStorage.getItem("youmatter_user_name") ||
      localStorage.getItem("userName") ||
      "Friend"
    );
  });

  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [greeting, setGreeting] = useState("Good day");

  const mood = MOOD_CONFIG[activeMood] || MOOD_CONFIG.neutral;
  const MoodIcon = mood.Icon;

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const metaName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split("@")[0];

        if (metaName) {
          setUserName(metaName);
          localStorage.setItem("userName", metaName);
          localStorage.setItem("youmatter_user_name", metaName);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const saved = localStorage.getItem("youmatter_mood_history");
    if (saved) {
      try { setMoodHistory(JSON.parse(saved)); } catch (err) { console.warn("Unable to load mood history", err); }
    }
    const lastMood = localStorage.getItem("youmatter_last_mood");
    if (lastMood && MOOD_CONFIG[lastMood]) setMood(lastMood);

    const testBackend = async () => {
      try { await api.get("/users"); } catch (err) { console.warn("Backend health check failed", err); }
    };
    testBackend();
  }, []);

  const handleMoodChange = (newMood: string) => {
    if (!MOOD_CONFIG[newMood]) return;
    setMood(newMood);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const entry: MoodEntry = {
      mood: newMood,
      time: timeStr,
      value: MOOD_VALUES[newMood] ?? 3,
    };
    setMoodHistory((prev) => {
      const updated = [...prev, entry].slice(-7);
      localStorage.setItem("youmatter_mood_history", JSON.stringify(updated));
      return updated;
    });
  };

  const dashItems = [
    {
      icon: <MessageCircle size={26} />,
      title: "AI Chat",
      desc: "Talk with your companion safely anytime.",
      path: "/chat",
      bg: "bg-[#f2ebff]",
      iconBg: "bg-[#e5d8ff]",
      iconColor: "text-[#8a6dff]",
    },
    {
      icon: <BookOpen size={26} />,
      title: "Journal",
      desc: "Write thoughts privately and reflect safely.",
      path: "/journal",
      bg: "bg-[#fff1f6]",
      iconBg: "bg-[#ffdbe7]",
      iconColor: "text-[#ff7fa8]",
    },
    {
      icon: <Activity size={26} />,
      title: "Mood Tracker",
      desc: "Understand your emotional patterns.",
      path: "/mood",
      bg: "bg-[#eef5ff]",
      iconBg: "bg-[#dbeaff]",
      iconColor: "text-[#6ea8fe]",
    },
    {
      icon: <Wind size={26} />,
      title: "Breathing",
      desc: "Relax your mind with guided breathing.",
      path: "/breathing",
      bg: "bg-[#e7faf4]",
      iconBg: "bg-[#cff5ea]",
      iconColor: "text-[#39b8a3]",
    },
    {
      icon: <HeartHandshake size={26} />,
      title: "Support",
      desc: "Reach out whenever things feel overwhelming.",
      path: "/support",
      bg: "bg-[#fff3ea]",
      iconBg: "bg-[#ffe3cb]",
      iconColor: "text-[#ff9f43]",
    },
    {
      icon: <Sparkles size={26} />,
      title: "Games",
      desc: "Relax and distract your mind with calming games.",
      path: "/games",
      bg: "bg-[#f4ecff]",
      iconBg: "bg-[#e6d7ff]",
      iconColor: "text-[#9b6dff]",
    },
  ];

  return (
    <div
      className="flex min-h-screen flex-col lg:flex-row transition-colors duration-500"
      style={{ backgroundColor: theme.pageBg }}
    >
      {/* Dynamic Ambient Light Spheres */}
      <div
        className="pointer-events-none fixed left-[-120px] top-[-80px] h-[550px] w-[550px] rounded-full blur-[140px] opacity-25 transition-all duration-1000 animate-pulse"
        style={{ background: theme.orb1 }}
      />
      <div
        className="pointer-events-none fixed bottom-[-80px] right-[-80px] h-[500px] w-[500px] rounded-full blur-[120px] opacity-20 transition-all duration-1000"
        style={{ background: theme.orb2 }}
      />

      {/* SIDEBAR */}
      <Sidebar />

      <main className="relative flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px] space-y-8">

          {/* ── TOP BAR ── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest transition-colors duration-500"
                style={{ color: theme.accent }}
              >
                {greeting}
              </p>
              <h1
                className="mt-1 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl transition-colors duration-500 tracking-tight"
                style={{ color: theme.text }}
              >
                Welcome back,{" "}
                <span
                  className="transition-colors duration-500 underline decoration-wavy decoration-2"
                  style={{ color: theme.accent, textDecorationColor: theme.accent + "66" }}
                >
                  {userName}
                </span>
              </h1>
              <p
                className="mt-2 max-w-lg text-base leading-7 sm:text-lg transition-colors duration-500 font-medium"
                style={{ color: theme.subtext }}
              >
                Your feelings matter. Take a gentle pause and check in with yourself today.
              </p>
            </div>

            {/* Profile chip */}
            <div
              className="hidden xl:flex shrink-0 items-center gap-3 rounded-[24px] backdrop-blur-md px-5 py-3 shadow-sm border transition-colors duration-500"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            >
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center text-lg font-black text-white"
                style={{ background: theme.accent }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: theme.text }}>{userName}</p>
                <p className="text-xs font-medium" style={{ color: theme.subtext }}>Mental Wellness Journey</p>
              </div>
              <span
                className="ml-2 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-700"
                style={{ background: theme.soft, color: theme.text }}
              >
                <MoodIcon size={13} />
                {mood.label}
              </span>
            </div>
          </div>

          {/* ── HERO SECTION: AI CHAT + MOOD PANEL ── */}
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">

            {/* AI CHAT HERO */}
            <div
              className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 transition-all duration-500 border shadow-xs"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            >
              <div
                className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl transition-all duration-700"
                style={{ background: theme.accent }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: theme.accent + "22" }}
                  >
                    <Sparkles size={22} style={{ color: theme.accent }} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: theme.accent }}
                    >
                      AI Companion
                    </p>
                    <p className="text-xs font-medium" style={{ color: theme.subtext }}>Always here for you</p>
                  </div>
                </div>

                <h2
                  className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl transition-colors duration-500 tracking-tight"
                  style={{ color: theme.text }}
                >
                  Need someone<br />to talk to?
                </h2>

                <p
                  className="mt-4 max-w-lg text-base leading-7 font-medium transition-colors duration-500"
                  style={{ color: theme.subtext }}
                >
                  Your safe place to vent, reflect, breathe and feel heard — without judgment, without limits.
                </p>

                {/* Quote */}
                <div
                  className="mt-6 rounded-2xl px-5 py-4 text-sm font-medium leading-6 italic transition-all duration-700"
                  style={{
                    background: theme.soft,
                    color: theme.text,
                    borderLeft: `4px solid ${theme.accent}`,
                  }}
                >
                  {theme.quote}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/chat")}
                    className="flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
                    style={{ background: theme.accent }}
                  >
                    Open AI Chat <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate("/breathing")}
                    className="flex items-center gap-2 rounded-2xl border px-6 py-4 text-sm font-bold transition-all hover:-translate-y-0.5 active:scale-[0.97]"
                    style={{
                      borderColor: theme.border,
                      color: theme.text,
                      backgroundColor: theme.soft,
                    }}
                  >
                    <Wind size={16} /> Breathe first
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Mood + Graph */}
            <div className="flex flex-col gap-5">
              {/* MOOD PICKER */}
              <div
                className="rounded-[28px] p-5 shadow-xs border transition-colors duration-500"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest transition-colors duration-700"
                  style={{ color: theme.accent }}
                >
                  Daily check-in
                </p>
                <h2 className="mt-1 text-2xl font-black" style={{ color: theme.text }}>
                  How are you feeling?
                </h2>
                <div className="mt-4">
                  <MoodSectionWrapper onMoodChange={handleMoodChange} currentMood={activeMood} />
                </div>
              </div>

              {/* MOOD GRAPH */}
              <div
                className="rounded-[28px] p-5 shadow-xs border flex-1 transition-colors duration-500"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest transition-colors duration-700"
                      style={{ color: theme.accent }}
                    >
                      Mood Journey
                    </p>
                    <h2 className="mt-0.5 text-lg font-black" style={{ color: theme.text }}>
                      Today's Trend
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate("/mood")}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all hover:opacity-80"
                    style={{ background: theme.soft, color: theme.text }}
                  >
                    Full View
                  </button>
                </div>
                <MoodGraph
                  entries={moodHistory}
                  color={theme.accent}
                  bg={theme.soft}
                />
              </div>
            </div>
          </div>

          {/* ── SECONDARY ROW: Journal + Calm Tools ── */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {/* RECENT JOURNAL */}
            <div
              className="rounded-[28px] p-6 shadow-xs border xl:col-span-1 transition-colors duration-500"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
                    Recent Journal
                  </p>
                  <h2 className="mt-1 text-xl font-black" style={{ color: theme.text }}>
                    Latest Reflection
                  </h2>
                </div>
                <button
                  onClick={() => navigate("/journal")}
                  className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition hover:opacity-80"
                  style={{ backgroundColor: theme.soft, color: theme.text }}
                >
                  Open →
                </button>
              </div>
              <div className="mt-4 rounded-2xl p-4 min-h-[80px]" style={{ backgroundColor: theme.soft }}>
                <p className="text-sm leading-7" style={{ color: theme.subtext }}>
                  Your latest journal entry will appear here.
                </p>
              </div>
            </div>

            {/* BREATHING */}
            <div
              className="rounded-[28px] p-6 shadow-xs border transition-colors duration-500"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            >
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
                Breathing
              </p>
              <h2 className="mt-1 text-xl font-black" style={{ color: theme.text }}>Calm Breath</h2>
              <div className="mt-5 flex items-center justify-center">
                <div
                  className="relative flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.soft }}
                >
                  <div
                    className="h-12 w-12 rounded-full"
                    style={{ backgroundColor: theme.accent, animation: "breathe 4s ease-in-out infinite" }}
                  />
                </div>
              </div>
              <button
                onClick={() => navigate("/breathing")}
                className="mt-5 w-full rounded-2xl py-3 text-sm font-black text-white transition hover:opacity-90 active:scale-95 shadow-xs"
                style={{ backgroundColor: theme.accent }}
              >
                Start Breathing
              </button>
            </div>

            {/* RELAX / GAMES */}
            <div
              className="rounded-[28px] p-6 shadow-xs border transition-colors duration-500"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            >
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
                Relax Activity
              </p>
              <h2 className="mt-1 text-xl font-black" style={{ color: theme.text }}>Calm Your Mind</h2>
              <div className="mt-5 flex items-center justify-center gap-3">
                {[theme.accent, "#38bdf8", "#34d399"].map((c, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-full"
                    style={{
                      background: c,
                      animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
              <p className="mt-4 text-center text-xs leading-6" style={{ color: theme.subtext }}>
                Follow the moving dots and slow your breathing.
              </p>
              <button
                onClick={() => navigate("/games")}
                className="mt-4 w-full rounded-2xl py-3 text-sm font-black text-white transition hover:opacity-90 active:scale-95 shadow-xs"
                style={{ backgroundColor: theme.accent }}
              >
                Open Activity
              </button>
            </div>
          </div>

          {/* ── REMINDER BANNER ── */}
          <div
            className="rounded-[28px] px-8 py-6 transition-all duration-700 border"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: theme.accent }}
                >
                  Gentle Reminder
                </p>
                <p
                  className="mt-2 text-xl font-black leading-snug sm:text-2xl transition-colors duration-500"
                  style={{ color: theme.text }}
                >
                  "Healing takes time. Small progress still matters."
                </p>
              </div>
              <div
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{ background: theme.accent + "22" }}
              >
                <MoodIcon size={28} style={{ color: theme.accent }} />
              </div>
            </div>
          </div>

          {/* ── DASHBOARD GRID ── */}
          <div>
            <div className="mb-5">
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: theme.accent }}
              >
                Dashboard
              </p>
              <h2
                className="mt-1 text-2xl font-black sm:text-3xl transition-colors duration-500 tracking-tight"
                style={{ color: theme.text }}
              >
                Explore Your Safe Space
              </h2>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
              {dashItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="group flex flex-col items-start rounded-[24px] p-5 text-left transition-all duration-300 hover:-translate-y-1 border shadow-xs"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
                  >
                    {item.icon}
                  </div>
                  <h3
                    className="mt-4 text-base font-black leading-tight transition-colors duration-500"
                    style={{ color: theme.text }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-1.5 text-xs leading-5 transition-colors duration-500 font-medium"
                    style={{ color: theme.subtext }}
                  >
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="h-4" />
        </div>
      </main>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.35); opacity: 0.6; }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

// ─── MoodSection Wrapper ───────────────────────────────────────────────────────
const PICKER_MOODS: { key: string; Icon: React.ElementType; label: string; color: string }[] = [
  { key: "happy",   Icon: Smile,      label: "Happy",   color: "#f5a623" },
  { key: "calm",    Icon: Leaf,       label: "Calm",    color: "#10b981" },
  { key: "neutral", Icon: Minus,      label: "Neutral", color: "#8a6dff" },
  { key: "anxious", Icon: Zap,        label: "Anxious", color: "#a855f7" },
  { key: "sad",     Icon: CloudRain,  label: "Sad",     color: "#3b82f6" },
  { key: "angry",   Icon: Flame,      label: "Angry",   color: "#ef4444" },
];

function MoodSectionWrapper({
  onMoodChange,
  currentMood,
}: {
  onMoodChange: (mood: string) => void;
  currentMood: string;
}) {
  const { theme } = useMood();
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {PICKER_MOODS.map(({ key, Icon, label, color }) => {
          const isSelected = currentMood === key;
          return (
            <button
              key={key}
              onClick={() => onMoodChange(key)}
              aria-pressed={isSelected}
              className="flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-left transition-all duration-200"
              style={{
                backgroundColor: isSelected ? color + "22" : theme.soft,
                borderColor: isSelected ? color : theme.border,
                borderWidth: "1.5px",
                borderStyle: "solid",
                transform: isSelected ? "scale(1.04)" : "scale(1)",
              }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: isSelected ? color + "22" : color + "15" }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <span
                className="text-[11px] font-bold"
                style={{ color: isSelected ? color : theme.subtext }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Real MoodSection hidden — handles backend persistence */}
      <div className="h-0 overflow-hidden opacity-0">
        <MoodSection />
      </div>
    </div>
  );
}

export default Home;
