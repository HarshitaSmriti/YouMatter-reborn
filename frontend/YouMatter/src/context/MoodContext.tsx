import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Smile,
  Leaf,
  Minus,
  Zap,
  CloudRain,
  Flame,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MoodTheme {
  id: string;
  label: string;
  Icon: LucideIcon;
  bgGradient: string;
  pageBg: string;
  cardBg: string;
  accent: string;
  accentHover: string;
  text: string;
  subtext: string;
  soft: string;
  orb1: string;
  orb2: string;
  border: string;
  quote: string;
}

export const LIGHT_MOOD_THEMES: Record<string, MoodTheme> = {
  happy: {
    id: "happy",
    label: "Happy",
    Icon: Smile,
    bgGradient: "from-[#fffdf5] via-[#fffbeb] to-[#fef3c7]",
    pageBg: "#fffdf5",
    cardBg: "#ffffff",
    accent: "#d97706",
    accentHover: "#b45309",
    text: "#451a03",
    subtext: "#78350f",
    soft: "#fff7ed",
    orb1: "#fde68a",
    orb2: "#fcd34d",
    border: "#fed7aa",
    quote: "Keep shining! Your joy radiates around you.",
  },
  calm: {
    id: "calm",
    label: "Calm",
    Icon: Leaf,
    bgGradient: "from-[#f4fbf7] via-[#ecfdf5] to-[#d1fae5]",
    pageBg: "#f4fbf7",
    cardBg: "#ffffff",
    accent: "#059669",
    accentHover: "#047857",
    text: "#064e3b",
    subtext: "#047857",
    soft: "#ecfdf5",
    orb1: "#a7f3d0",
    orb2: "#6ee7b7",
    border: "#a7f3d0",
    quote: "Peace comes from within. Take a gentle breath.",
  },
  neutral: {
    id: "neutral",
    label: "Neutral",
    Icon: Minus,
    bgGradient: "from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]",
    pageBg: "#f8fafc",
    cardBg: "#ffffff",
    accent: "#7c3aed",
    accentHover: "#6d28d9",
    text: "#0f172a",
    subtext: "#475569",
    soft: "#f1f5f9",
    orb1: "#c4b5fd",
    orb2: "#a78bfa",
    border: "#e2e8f0",
    quote: "Every moment is a fresh start. You're doing great.",
  },
  anxious: {
    id: "anxious",
    label: "Anxious",
    Icon: Zap,
    bgGradient: "from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]",
    pageBg: "#f0f9ff",
    cardBg: "#ffffff",
    accent: "#0284c7",
    accentHover: "#0369a1",
    text: "#0c4a6e",
    subtext: "#0369a1",
    soft: "#e0f2fe",
    orb1: "#bae6fd",
    orb2: "#7dd3fc",
    border: "#bae6fd",
    quote: "Pause and ground yourself. You are safe here.",
  },
  sad: {
    id: "sad",
    label: "Sad",
    Icon: CloudRain,
    bgGradient: "from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]",
    pageBg: "#f8fafc",
    cardBg: "#ffffff",
    accent: "#4f46e5",
    accentHover: "#4338ca",
    text: "#1e1b4b",
    subtext: "#4338ca",
    soft: "#e0e7ff",
    orb1: "#c7d2fe",
    orb2: "#a5b4fc",
    border: "#c7d2fe",
    quote: "Your feelings are valid. Take all the time you need.",
  },
  angry: {
    id: "angry",
    label: "Angry",
    Icon: Flame,
    bgGradient: "from-[#fff5f5] via-[#ffe4e6] to-[#fecdd3]",
    pageBg: "#fff5f5",
    cardBg: "#ffffff",
    accent: "#e11d48",
    accentHover: "#be123c",
    text: "#7f1d1d",
    subtext: "#be123c",
    soft: "#ffe4e6",
    orb1: "#fecdd3",
    orb2: "#fda4af",
    border: "#fecdd3",
    quote: "Let it out safely. Take a deep breath with us.",
  },
};

export const DARK_MOOD_THEMES: Record<string, MoodTheme> = {
  happy: {
    id: "happy",
    label: "Happy",
    Icon: Smile,
    bgGradient: "from-[#0f0d0a] via-[#1c1812] to-[#2a2215]",
    pageBg: "#0f0d0a",
    cardBg: "#1c1812",
    accent: "#f59e0b",
    accentHover: "#d97706",
    text: "#fef3c7",
    subtext: "#fde047",
    soft: "#2a2215",
    orb1: "#b45309",
    orb2: "#d97706",
    border: "#3a2e1c",
    quote: "Keep shining! Your joy radiates around you.",
  },
  calm: {
    id: "calm",
    label: "Calm",
    Icon: Leaf,
    bgGradient: "from-[#06120e] via-[#0d221b] to-[#133227]",
    pageBg: "#06120e",
    cardBg: "#0d221b",
    accent: "#10b981",
    accentHover: "#059669",
    text: "#f0fdf4",
    subtext: "#6ee7b7",
    soft: "#133227",
    orb1: "#047857",
    orb2: "#10b981",
    border: "#1d4838",
    quote: "Peace comes from within. Take a gentle breath.",
  },
  neutral: {
    id: "neutral",
    label: "Neutral",
    Icon: Minus,
    bgGradient: "from-[#090d16] via-[#111827] to-[#1f2937]",
    pageBg: "#090d16",
    cardBg: "#111827",
    accent: "#8b5cf6",
    accentHover: "#7c3aed",
    text: "#f8fafc",
    subtext: "#94a3b8",
    soft: "#1f2937",
    orb1: "#6d28d9",
    orb2: "#8b5cf6",
    border: "#374151",
    quote: "Every moment is a fresh start. You're doing great.",
  },
  anxious: {
    id: "anxious",
    label: "Anxious",
    Icon: Zap,
    bgGradient: "from-[#05131e] via-[#0a2234] to-[#10314a]",
    pageBg: "#05131e",
    cardBg: "#0a2234",
    accent: "#0ea5e9",
    accentHover: "#0284c7",
    text: "#f0f9ff",
    subtext: "#38bdf8",
    soft: "#10314a",
    orb1: "#0369a1",
    orb2: "#0ea5e9",
    border: "#184567",
    quote: "Pause and ground yourself. You are safe here.",
  },
  sad: {
    id: "sad",
    label: "Sad",
    Icon: CloudRain,
    bgGradient: "from-[#0a0d1a] via-[#121730] to-[#1a2245]",
    pageBg: "#0a0d1a",
    cardBg: "#121730",
    accent: "#6366f1",
    accentHover: "#4f46e5",
    text: "#f8fafc",
    subtext: "#818cf8",
    soft: "#1a2245",
    orb1: "#4338ca",
    orb2: "#6366f1",
    border: "#273363",
    quote: "Your feelings are valid. Take all the time you need.",
  },
  angry: {
    id: "angry",
    label: "Angry",
    Icon: Flame,
    bgGradient: "from-[#14070a] via-[#240c12] to-[#36121b]",
    pageBg: "#14070a",
    cardBg: "#240c12",
    accent: "#f43f5e",
    accentHover: "#e11d48",
    text: "#fff1f2",
    subtext: "#fb7185",
    soft: "#36121b",
    orb1: "#be123c",
    orb2: "#f43f5e",
    border: "#4d1a27",
    quote: "Let it out safely. Take a deep breath with us.",
  },
};

export const MOOD_THEMES = LIGHT_MOOD_THEMES;

interface MoodContextType {
  activeMood: string;
  setMood: (mood: string) => void;
  theme: MoodTheme;
  isDarkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
}

const MoodContext = createContext<MoodContextType>({
  activeMood: "neutral",
  setMood: () => {},
  theme: LIGHT_MOOD_THEMES.neutral,
  isDarkMode: false,
  setDarkMode: () => {},
});

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMood, setActiveMood] = useState<string>(() => {
    return localStorage.getItem("youmatter_last_mood") || "neutral";
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      document.documentElement.classList.contains("dark")
    );
  });

  const themeMap = isDarkMode ? DARK_MOOD_THEMES : LIGHT_MOOD_THEMES;
  const theme = themeMap[activeMood] || themeMap.neutral;

  const setMood = (newMood: string) => {
    if (LIGHT_MOOD_THEMES[newMood]) {
      setActiveMood(newMood);
      localStorage.setItem("youmatter_last_mood", newMood);
    }
  };

  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.body.style.backgroundColor = theme.pageBg;
    document.body.style.color = theme.text;
    document.body.style.transition = "background-color 500ms ease-in-out, color 300ms ease-in-out";
  }, [theme, isDarkMode]);

  return (
    <MoodContext.Provider value={{ activeMood, setMood, theme, isDarkMode, setDarkMode }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => useContext(MoodContext);
