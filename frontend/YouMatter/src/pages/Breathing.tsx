import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wind,
  Waves,
  Orbit,
  Flower2,
  Sparkles,
  CircleDot,
} from "lucide-react";

import { useMood } from "../context/MoodContext";

function Breathing() {
  const navigate = useNavigate();
  const { theme } = useMood();

  const [activeExercise, setActiveExercise] = useState(0);

  const exercises = [
    {
      title: "Calm Breath",
      description: "Follow the breathing circle and inhale slowly.",
      accent: "#10b981",
      icon: <Wind size={28} style={{ color: "#10b981" }} />,
      animation: (
        <div className="flex items-center justify-center py-10">
          <div className="flex h-40 w-40 animate-pulse items-center justify-center rounded-full bg-[#10b981]/20">
            <div className="h-24 w-24 rounded-full bg-[#10b981]" />
          </div>
        </div>
      ),
    },
    {
      title: "Ocean Waves",
      description: "Relax while the waves move smoothly.",
      accent: "#38bdf8",
      icon: <Waves size={28} style={{ color: "#38bdf8" }} />,
      animation: (
        <div className="flex items-end justify-center gap-3 py-12">
          <div className="h-20 w-6 animate-bounce rounded-full bg-[#38bdf8]" />
          <div className="h-28 w-6 animate-bounce rounded-full bg-[#0284c7] [animation-delay:0.2s]" />
          <div className="h-16 w-6 animate-bounce rounded-full bg-[#38bdf8] [animation-delay:0.4s]" />
        </div>
      ),
    },
    {
      title: "Orbit Focus",
      description: "Focus on the moving dot to calm your mind.",
      accent: "#8b5cf6",
      icon: <Orbit size={28} style={{ color: "#8b5cf6" }} />,
      animation: (
        <div className="flex items-center justify-center py-10">
          <div className="relative flex h-52 w-52 items-center justify-center">
            <div className="absolute h-20 w-20 rounded-full bg-[#8b5cf6]/20" />
            <div className="absolute h-44 w-44 rounded-full border-2 border-dashed border-[#8b5cf6]/40" />
            <div className="absolute h-44 w-44 animate-spin">
              <div className="absolute left-1/2 top-0 h-6 w-6 -translate-x-1/2 rounded-full bg-[#8b5cf6]" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Bloom Mind",
      description: "Watch the flower bloom calmly.",
      accent: "#ec4899",
      icon: <Flower2 size={28} style={{ color: "#ec4899" }} />,
      animation: (
        <div className="flex items-center justify-center py-10">
          <div className="relative flex h-56 w-56 items-center justify-center">
            <div className="absolute h-24 w-24 animate-pulse rounded-full bg-[#ec4899]/30 -top-2" />
            <div className="absolute h-24 w-24 animate-pulse rounded-full bg-[#ec4899]/40 -bottom-2" />
            <div className="absolute h-24 w-24 animate-pulse rounded-full bg-[#ec4899]/30 -left-2" />
            <div className="absolute h-24 w-24 animate-pulse rounded-full bg-[#ec4899]/40 -right-2" />
            <div className="relative z-10 h-20 w-20 animate-pulse rounded-full bg-[#ec4899]" />
          </div>
        </div>
      ),
    },
    {
      title: "Floating Dots",
      description: "Follow the moving dots and breathe slowly.",
      accent: "#f59e0b",
      icon: <CircleDot size={28} style={{ color: "#f59e0b" }} />,
      animation: (
        <div className="flex items-center justify-center gap-5 py-14">
          <div className="h-8 w-8 animate-bounce rounded-full bg-[#8b5cf6]" />
          <div className="h-8 w-8 animate-bounce rounded-full bg-[#10b981] [animation-delay:0.2s]" />
          <div className="h-8 w-8 animate-bounce rounded-full bg-[#38bdf8] [animation-delay:0.4s]" />
          <div className="h-8 w-8 animate-bounce rounded-full bg-[#ec4899] [animation-delay:0.6s]" />
        </div>
      ),
    },
  ];

  return (
    <div
      className="flex min-h-screen flex-col lg:flex-row transition-colors duration-500"
      style={{ backgroundColor: theme.pageBg }}
    >
      <Sidebar />

      <main className="flex-1 px-3 py-3 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={() => navigate("/home")}
            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl border shadow-xs transition hover:opacity-80 active:scale-95"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <ArrowLeft
              size={14}
              style={{ color: theme.accent }}
            />
          </button>

          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
              Calm Activities
            </p>

            <h1 className="mt-0.5 text-xl font-extrabold sm:text-3xl lg:text-4xl tracking-tight" style={{ color: theme.text }}>
              Breathing Exercises
            </h1>
          </div>
        </div>

        <p className="mt-1.5 sm:mt-4 max-w-[700px] text-xs sm:text-sm font-medium leading-relaxed" style={{ color: theme.subtext }}>
          Slow down your thoughts, relax your body and calm your breathing with gentle interactive exercises.
        </p>

        {/* GRID */}
        <div className="mt-4 sm:mt-8 grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {exercises.map((exercise, index) => {
            const isSelected = activeExercise === index;
            return (
              <button
                key={index}
                onClick={() => setActiveExercise(index)}
                className="rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 text-left transition-all duration-300 shadow-xs"
                style={{
                  backgroundColor: isSelected ? theme.soft : theme.cardBg,
                  borderColor: isSelected ? theme.accent : theme.border,
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                }}
              >
                <div
                  className="flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl"
                  style={{ backgroundColor: exercise.accent + "22" }}
                >
                  {exercise.icon}
                </div>

                <h3 className="mt-2 sm:mt-4 text-xs sm:text-base font-bold" style={{ color: theme.text }}>
                  {exercise.title}
                </h3>

                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs leading-tight font-medium" style={{ color: theme.subtext }}>
                  {exercise.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* ACTIVE */}
        <div
          className="mt-4 sm:mt-8 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xs border transition-colors duration-500"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div
              className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: exercises[activeExercise].accent + "22" }}
            >
              {exercises[activeExercise].icon}
            </div>

            <div>
              <h2 className="text-base sm:text-2xl font-bold" style={{ color: theme.text }}>
                {exercises[activeExercise].title}
              </h2>

              <p className="mt-0.5 text-xs sm:text-sm font-medium leading-relaxed" style={{ color: theme.subtext }}>
                {exercises[activeExercise].description}
              </p>
            </div>
          </div>

          {exercises[activeExercise].animation}

          <div
            className="mt-4 rounded-[20px] sm:rounded-[28px] p-3.5 sm:p-5 border transition-colors duration-500"
            style={{ backgroundColor: theme.soft, borderColor: theme.border }}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Sparkles
                size={18}
                style={{ color: theme.accent }}
              />

              <p className="text-xs sm:text-[15px] leading-5 sm:leading-7 font-medium" style={{ color: theme.text }}>
                Inhale slowly for 4 seconds, hold for 4 seconds and exhale gently for 6 seconds.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Breathing;