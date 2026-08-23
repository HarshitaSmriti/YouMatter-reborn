import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import {
  ArrowLeft, Smile, Leaf, CloudRain, Zap, Flame, Minus, Activity,
} from "lucide-react";

import { useMood } from "../context/MoodContext";

type MoodKey = "happy" | "calm" | "sad" | "anxious" | "angry" | "neutral";

interface MoodEntry {
  mood: MoodKey;
  timestamp: number;
}

const MOOD_CONFIG: Record<MoodKey, {
  Icon: React.ElementType; label: string; accent: string;
  moodScore: number; description: string;
}> = {
  happy: {
    Icon: Smile, label: "Happy", accent: "#f59e0b", moodScore: 6,
    description: "Feeling joyful and uplifted today.",
  },
  calm: {
    Icon: Leaf, label: "Calm", accent: "#10b981", moodScore: 5,
    description: "Steady and at peace with the moment.",
  },
  neutral: {
    Icon: Minus, label: "Neutral", accent: "#8b5cf6", moodScore: 4,
    description: "Neither high nor low — a balanced baseline.",
  },
  anxious: {
    Icon: Zap, label: "Anxious", accent: "#0ea5e9", moodScore: 3,
    description: "Your mind is racing — breathe slowly.",
  },
  sad: {
    Icon: CloudRain, label: "Sad", accent: "#6366f1", moodScore: 2,
    description: "Feeling low — that's okay. Be gentle with yourself.",
  },
  angry: {
    Icon: Flame, label: "Angry", accent: "#f43f5e", moodScore: 1,
    description: "Your feelings are valid. Let it out safely.",
  },
};

const MOOD_KEYS = Object.keys(MOOD_CONFIG) as MoodKey[];
const getStorageKey = () => {
  const user = localStorage.getItem("userName") || "guest";
  return `youmatter_${user}_mood_log`;
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

const Y_LABELS: Record<number, string> = {
  6: "Happy", 5: "Calm", 4: "Neutral", 3: "Anxious", 2: "Sad", 1: "Angry",
};

export default function MoodTracker() {
  const navigate = useNavigate();
  const { setMood, theme } = useMood();

  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [moodLog, setMoodLog] = useState<MoodEntry[]>([]);

  const fetchMoods = async () => {
    try {
      const res = await api.get("/mood");
      const backendData = res.data.data || [];
      if (backendData.length > 0) {
        const parsedLog: MoodEntry[] = backendData
          .slice()
          .reverse()
          .map((item: any) => ({
            mood: (item.mood_label || "neutral").toLowerCase() as MoodKey,
            timestamp: new Date(item.created_at).getTime(),
          }));
        setMoodLog(parsedLog);
        if (parsedLog.length > 0) {
          const latestMood = parsedLog[parsedLog.length - 1].mood;
          setSelectedMood(latestMood);
        }
      } else {
        const saved = localStorage.getItem(getStorageKey());
        if (saved) setMoodLog(JSON.parse(saved));
      }
    } catch (err) {
      console.warn("Unable to fetch mood from backend", err);
      const saved = localStorage.getItem(getStorageKey());
      if (saved) setMoodLog(JSON.parse(saved));
    }
  };

  useEffect(() => {
    fetchMoods();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(moodLog));
    } catch (err) {
      console.warn("Unable to save mood log", err);
    }
  }, [moodLog]);

  const handleSelect = async (key: MoodKey) => {
    setSelectedMood(key);
    setMood(key);
    try {
      const moodScoreMap: Record<MoodKey, number> = {
        happy: 6, calm: 5, neutral: 4, anxious: 3, sad: 2, angry: 1,
      };
      await api.post("/mood", {
        mood_score: moodScoreMap[key],
        mood_label: key,
        note: `User logged ${key} mood`,
      });
      await fetchMoods();
    } catch (err) {
      console.warn("Failed to sync mood to backend:", err);
      setMoodLog((prev) => [...prev, { mood: key, timestamp: Date.now() }]);
    }
  };

  // Chart
  const chartW = 560; const chartH = 160;
  const padL = 68; const padR = 16; const padT = 10; const padB = 28;
  const plotW = chartW - padL - padR; const plotH = chartH - padT - padB;
  const visibleLog = moodLog.slice(-20);
  const scoreToY = (s: number) => padT + plotH - ((s - 1) / 5) * plotH;
  const idxToX = (i: number) =>
    visibleLog.length === 1 ? padL + plotW / 2 : padL + (i / (visibleLog.length - 1)) * plotW;
  const points = visibleLog.map((e, i) => `${idxToX(i)},${scoreToY(MOOD_CONFIG[e.mood].moodScore)}`).join(" ");
  const fillPath = visibleLog.length > 1
    ? `M ${idxToX(0)},${scoreToY(MOOD_CONFIG[visibleLog[0].mood].moodScore)} ` +
      visibleLog.slice(1).map((e, i) => `L ${idxToX(i + 1)},${scoreToY(MOOD_CONFIG[e.mood].moodScore)}`).join(" ") +
      ` L ${idxToX(visibleLog.length - 1)},${padT + plotH} L ${padL},${padT + plotH} Z`
    : "";

  return (
    <div
      className="flex min-h-screen flex-col lg:flex-row transition-colors duration-500"
      style={{ backgroundColor: theme.pageBg }}
    >
      <Sidebar />

      <main className="relative flex-1 px-3 py-3 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-2.5 sm:gap-4 mb-2.5 sm:mb-4">
          <button
            onClick={() => navigate("/home")}
            className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-opacity hover:opacity-80 active:scale-95"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            aria-label="Go back"
          >
            <ArrowLeft size={14} style={{ color: theme.accent }} />
          </button>
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide" style={{ color: theme.accent }}>Mood tracking</p>
            <h1 className="text-xl font-extrabold sm:text-3xl tracking-tight" style={{ color: theme.text }}>How are you feeling?</h1>
          </div>
        </div>

        <p className="mb-4 sm:mb-6 max-w-lg text-xs sm:text-sm font-medium leading-relaxed" style={{ color: theme.subtext }}>
          Track your emotions gently and understand your patterns over time.
        </p>

        {/* Mood selector card */}
        <div
          className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 mb-4 sm:mb-6 shadow-xs border transition-colors duration-500"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <div className="flex items-center gap-2.5 sm:gap-3.5 mb-3.5 sm:mb-5">
            <div
              className="flex h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: theme.accent + "22" }}
            >
              <Activity size={17} style={{ color: theme.accent }} />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold" style={{ color: theme.text }}>Daily mood check-in</h2>
              <p className="text-[11px] sm:text-xs font-medium" style={{ color: theme.subtext }}>Select the emotion closest to how you feel right now</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
            {MOOD_KEYS.map((key) => {
              const m = MOOD_CONFIG[key]; const Icon = m.Icon; const isSelected = selectedMood === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  aria-pressed={isSelected}
                  className="flex flex-col items-start rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left transition-all duration-200"
                  style={{
                    backgroundColor: isSelected ? m.accent + "22" : theme.soft,
                    borderColor: isSelected ? m.accent : theme.border,
                    borderWidth: "1.5px",
                    borderStyle: "solid",
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <div
                    className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg mb-2 sm:mb-3"
                    style={{ backgroundColor: m.accent + "22" }}
                  >
                    <Icon size={16} style={{ color: m.accent }} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold mb-0.5" style={{ color: theme.text }}>{m.label}</h3>
                  <p className="text-[10px] sm:text-xs leading-normal font-medium" style={{ color: theme.subtext }}>{m.description}</p>
                </button>
              );
            })}
          </div>

          {selectedMood && (
            <div
              className="mt-3.5 sm:mt-5 rounded-xl p-3 sm:p-4 flex items-center gap-3 border transition-all duration-500"
              style={{ backgroundColor: theme.soft, borderColor: theme.border }}
            >
              <div
                className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: theme.accent + "22" }}
              >
                <Activity size={16} style={{ color: theme.accent }} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: theme.accent }}>Mood recorded</p>
                <p className="text-xs sm:text-sm font-bold" style={{ color: theme.text }}>{MOOD_CONFIG[selectedMood].label} — {MOOD_CONFIG[selectedMood].description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Graph card */}
        <div
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border transition-colors duration-500"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: theme.accent }}>Mood analytics</p>
              <h2 className="text-base sm:text-xl font-bold" style={{ color: theme.text }}>
                {moodLog.length > 0 ? "Your mood journey" : "Log a mood to start your chart"}
              </h2>
            </div>
            {moodLog.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="rounded-xl px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: theme.soft, color: theme.accent }}>
                  {moodLog.length} log{moodLog.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => { setMoodLog([]); try { localStorage.removeItem(getStorageKey()); } catch (err) { console.warn("Unable to clear mood log", err); } }}
                  className="rounded-xl px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {moodLog.length > 0 && <p className="text-sm font-medium mb-6" style={{ color: theme.subtext }}>Each point is a mood you logged — see how you've been feeling</p>}

          {moodLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl py-14" style={{ backgroundColor: theme.soft }}>
              <Activity size={32} className="mb-3 opacity-30" style={{ color: theme.accent }} />
              <p className="text-sm font-medium" style={{ color: theme.subtext }}>Pick a mood above — your chart will appear here</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet" style={{ minWidth: 320, display: "block" }}>
                <defs>
                  <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.accent} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={theme.accent} stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                {[1, 2, 3, 4, 5, 6].map((score) => (
                  <g key={score}>
                    <line x1={padL} y1={scoreToY(score)} x2={chartW - padR} y2={scoreToY(score)} stroke={theme.border} strokeWidth="1" />
                    <text x={padL - 8} y={scoreToY(score) + 4} textAnchor="end" fontSize="9" fill={theme.subtext} fontWeight="600">{Y_LABELS[score]}</text>
                  </g>
                ))}
                {visibleLog.length > 1 && <path d={fillPath} fill="url(#moodFill)" />}
                {visibleLog.length > 1 && <polyline points={points} fill="none" stroke={theme.accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
                {visibleLog.map((entry, i) => {
                  const m = MOOD_CONFIG[entry.mood];
                  const cx = idxToX(i); const cy = scoreToY(m.moodScore); const isLast = i === visibleLog.length - 1;
                  return (
                    <g key={i}>
                      {isLast && <circle cx={cx} cy={cy} r="9" fill={m.accent} opacity="0.2" />}
                      <circle cx={cx} cy={cy} r={isLast ? 5.5 : 4} fill={isLast ? m.accent : theme.cardBg} stroke={m.accent} strokeWidth="2" />
                      {(i === 0 || isLast || i % 4 === 0) && (
                        <text x={cx} y={chartH - 4} textAnchor="middle" fontSize="8.5" fill={theme.subtext} fontWeight="500">
                          {visibleLog.length > 8 ? formatDate(entry.timestamp) : formatTime(entry.timestamp)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {moodLog.length > 0 && (
            <div className="mt-6 border-t pt-5" style={{ borderColor: theme.border }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: theme.subtext }}>Recent entries</p>
              <div className="flex flex-col gap-2">
                {[...moodLog].reverse().slice(0, 5).map((entry, i) => {
                  const m = MOOD_CONFIG[entry.mood]; const Icon = m.Icon;
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2 border" style={{ backgroundColor: theme.soft, borderColor: theme.border }}>
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: m.accent + "22" }}>
                        <Icon size={13} style={{ color: m.accent }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: theme.text }}>{m.label}</span>
                      <span className="ml-auto text-xs font-medium" style={{ color: theme.subtext }}>{formatDate(entry.timestamp)} {formatTime(entry.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
