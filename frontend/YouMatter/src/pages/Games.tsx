import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Brain,
  Flower2,
  Sparkles,
  Target,
  CircleDot,
  Heart,
  Cloud,
  Moon,
  Star,
} from "lucide-react";

const COLOR_MATCH_COLORS = [
  "#8a6dff",
  "#39b8a3",
  "#ff7fa8",
  "#6ea8fe",
];

function MemoryCardGame({
  setScore,
}: {
  setScore: React.Dispatch<
    React.SetStateAction<number>
  >;
}) {
  const icons = [
    Sparkles,
    Sparkles,

    Heart,
    Heart,

    Flower2,
    Flower2,

    Cloud,
    Cloud,

    Moon,
    Moon,

    Star,
    Star,
  ];

  const shuffled = [...icons].sort(
    () => Math.random() - 0.5
  );

  const [cards] = useState(shuffled);

  const [flipped, setFlipped] = useState<
    number[]
  >([]);

  const [matched, setMatched] = useState<
    number[]
  >([]);

  const [disabled, setDisabled] =
    useState(false);

  const handleFlip = (index: number) => {
    if (
      disabled ||
      flipped.includes(index) ||
      matched.includes(index)
    )
      return;

    const updated = [...flipped, index];

    setFlipped(updated);

    if (updated.length === 2) {
      setDisabled(true);

      const first = cards[updated[0]];

      const second = cards[updated[1]];

      if (first === second) {
        setMatched((prev) => [
          ...prev,
          ...updated,
        ]);

        setScore((prev) => prev + 3);

        setFlipped([]);

        setDisabled(false);
      } else {
        setTimeout(() => {
          setFlipped([]);

          setDisabled(false);
        }, 900);
      }
    }
  };

  return (
    <div className="py-10">
      <p className="mb-8 text-center text-lg font-bold text-[#241b43]">
        Match the calming icons
      </p>

      <div className="grid grid-cols-3 gap-5 sm:grid-cols-4">
        {cards.map((Icon, index) => {
          const visible =
            flipped.includes(index) ||
            matched.includes(index);

          return (
            <button
              key={index}
              onClick={() =>
                handleFlip(index)
              }
              className={`flex aspect-square items-center justify-center rounded-[28px] transition-all duration-300 ${
                visible
                  ? "bg-white"
                  : "bg-[#dbeaff]"
              }`}
            >
              {visible && (
                <Icon
                  size={38}
                  className="text-[#8a6dff]"
                />
              )}
            </button>
          );
        })}
      </div>

      {matched.length === cards.length && (
        <p className="mt-8 text-center text-2xl font-black text-[#6ea8fe]">
          Perfect Match
        </p>
      )}
    </div>
  );
}

function ColorMatchGame({
  setScore,
}: {
  setScore: React.Dispatch<
    React.SetStateAction<number>
  >;
}) {
  const colors = COLOR_MATCH_COLORS;

  const [targetColor, setTargetColor] =
    useState(colors[0]);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    setTargetColor(
      colors[
        Math.floor(
          Math.random() * colors.length
        )
      ]
    );
  }, [colors]);

  const handleColorClick = (
    color: string
  ) => {
    if (color === targetColor) {
      setScore((prev) => prev + 2);

      setMessage("Perfect Match");

      let nextColor = targetColor;

      while (
        nextColor === targetColor
      ) {
        nextColor =
          colors[
            Math.floor(
              Math.random() *
                colors.length
            )
          ];
      }

      setTargetColor(nextColor);
    } else {
      setMessage("Try Again");
    }

    setTimeout(() => {
      setMessage("");
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center py-12">
      <p className="text-lg font-bold text-[#241b43]">
        Match This Color
      </p>

      <div
        className="mt-8 h-40 w-40 rounded-full shadow-lg transition-all duration-300"
        style={{
          backgroundColor: targetColor,
        }}
      />

      <div className="mt-12 flex flex-wrap justify-center gap-6">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() =>
              handleColorClick(color)
            }
            className="h-24 w-24 rounded-3xl transition hover:scale-110"
            style={{
              backgroundColor: color,
            }}
          />
        ))}
      </div>

      <p className="mt-10 text-2xl font-black text-[#241b43]">
        {message}
      </p>
    </div>
  );
}

import { useMood } from "../context/MoodContext";

function Games() {
  const navigate = useNavigate();
  const { theme } = useMood();

  const [activeGame, setActiveGame] =
    useState(0);

  const [score, setScore] = useState(0);

  /* =========================
     DOT GAME
  ========================= */

  const [targetDot, setTargetDot] =
    useState(0);

  const [dotMessage, setDotMessage] =
    useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTargetDot(
        Math.floor(Math.random() * 9)
      );
    }, 900);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number) => {
    if (index === targetDot) {
      setScore((prev) => prev + 1);

      setDotMessage("Nice Focus");
    } else {
      setDotMessage("Missed");
    }

    setTimeout(() => {
      setDotMessage("");
    }, 1000);
  };

  /* =========================
     MEMORY NUMBER GAME
  ========================= */

  const [memoryPattern, setMemoryPattern] =
    useState<number[]>([]);

  const [showPattern, setShowPattern] =
    useState(false);

  const [userPattern, setUserPattern] =
    useState<number[]>([]);

  const [memoryMessage, setMemoryMessage] =
    useState("");

  const generatePattern = () => {
    const pattern = Array.from(
      { length: 4 },
      () => Math.floor(Math.random() * 9)
    );

    setMemoryPattern(pattern);

    setUserPattern([]);

    setShowPattern(true);

    setMemoryMessage("");

    setTimeout(() => {
      setShowPattern(false);
    }, 3000);
  };

  const handleMemoryClick = (num: number) => {
    if (showPattern) return;

    const updated = [...userPattern, num];

    setUserPattern(updated);

    if (
      updated.length === memoryPattern.length
    ) {
      const correct = updated.every(
        (item, i) =>
          item === memoryPattern[i]
      );

      if (correct) {
        setScore((prev) => prev + 5);

        setMemoryMessage(
          "Correct Pattern"
        );
      } else {
        setMemoryMessage("Try Again");
      }

      setTimeout(() => {
        setMemoryMessage("");
      }, 1500);
    }
  };

  /* =========================
     FLOWER GAME
  ========================= */

  const [flowerLevel, setFlowerLevel] =
    useState(0);

  const bloomFlower = () => {
    if (flowerLevel < 8) {
      setFlowerLevel((prev) => prev + 1);

      setScore((prev) => prev + 1);
    } else {
      setFlowerLevel(0);
    }
  };

  const games = [
    {
      title: "Catch The Dot",

      icon: Target,

      color: "bg-[#f4ecff]",

      content: (
        <div className="py-10">
          <p className="mb-6 text-center text-lg font-bold text-[#241b43]">
            Tap the moving calm dot
          </p>

          <div className="grid grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handleDotClick(index)
                  }
                  className={`h-28 rounded-3xl transition-all duration-300 ${
                    index === targetDot
                      ? "scale-105 bg-[#8a6dff]"
                      : "bg-white"
                  }`}
                />
              )
            )}
          </div>

          <p className="mt-8 text-center text-xl font-bold text-[#8a6dff]">
            {dotMessage}
          </p>
        </div>
      ),
    },

    {
      title: "Memory Pattern",

      icon: Brain,

      color: "bg-[#eef5ff]",

      content: (
        <div className="py-10">
          <button
            onClick={generatePattern}
            className="rounded-2xl bg-[#6ea8fe] px-6 py-4 font-bold text-white"
          >
            Generate Pattern
          </button>

          <div className="mt-8">
            {showPattern ? (
              <p className="text-3xl font-black text-[#241b43]">
                {memoryPattern.join(" - ")}
              </p>
            ) : (
              <p className="text-lg font-semibold text-[#8d84ad]">
                Repeat the hidden pattern
              </p>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map(
              (_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    handleMemoryClick(i)
                  }
                  className="h-24 rounded-3xl bg-white text-2xl font-black text-[#241b43] transition hover:scale-105"
                >
                  {i}
                </button>
              )
            )}
          </div>

          <p className="mt-8 text-center text-2xl font-black text-[#6ea8fe]">
            {memoryMessage}
          </p>
        </div>
      ),
    },

    {
      title: "Bloom Garden",

      icon: Flower2,

      color: "bg-[#fff1f6]",

      content: (
        <div className="flex flex-col items-center py-10">
          <div className="relative flex h-72 w-72 items-center justify-center">
            {Array.from({
              length: flowerLevel,
            }).map((_, i) => (
              <div
                key={i}
                className="absolute h-24 w-24 rounded-full bg-[#ffc4d8]"
                style={{
                  transform: `rotate(${
                    i * 45
                  }deg) translateY(-80px)`,
                }}
              />
            ))}

            <div className="h-24 w-24 rounded-full bg-[#ff7fa8]" />
          </div>

          <button
            onClick={bloomFlower}
            className="mt-10 rounded-2xl bg-[#ff7fa8] px-6 py-4 font-bold text-white"
          >
            Bloom Flower
          </button>
        </div>
      ),
    },

    {
      title: "Color Match",

      icon: CircleDot,

      color: "bg-[#eefaff]",

      content: (
        <ColorMatchGame
          setScore={setScore}
        />
      ),
    },

    {
      title: "Memory Cards",

      icon: Sparkles,

      color: "bg-[#f8f4ff]",

      content: (
        <MemoryCardGame
          setScore={setScore}
        />
      ),
    },
  ];

  return (
    <div
      className="flex min-h-screen flex-col lg:flex-row transition-colors duration-500"
      style={{ backgroundColor: theme.pageBg }}
    >
      <Sidebar />

      <main className="flex-1 px-3.5 py-4 sm:px-8">
        {/* HEADER */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/home")}
            className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl border shadow-xs transition hover:opacity-80 active:scale-95"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <ArrowLeft
              size={16}
              style={{ color: theme.accent }}
            />
          </button>

          <div>
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
              Interactive Calm Games
            </p>

            <h1 className="mt-0.5 text-2xl font-black sm:text-4xl lg:text-5xl tracking-tight" style={{ color: theme.text }}>
              Relax & Distract
            </h1>
          </div>
        </div>

        {/* SCORE */}
        <div
          className="mt-4 sm:mt-8 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border transition-colors duration-500"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <h2 className="text-xl sm:text-[28px] font-black" style={{ color: theme.text }}>
            Calm Score: <span style={{ color: theme.accent }}>{score}</span>
          </h2>
        </div>

        {/* GAME BUTTONS */}
        <div className="mt-5 sm:mt-10 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {games.map((game, index) => {
            const Icon = game.icon;
            const isSelected = activeGame === index;
            return (
              <button
                key={index}
                onClick={() => setActiveGame(index)}
                className="rounded-[20px] sm:rounded-[30px] border-2 p-3.5 sm:p-5 text-left transition-all duration-300 shadow-xs"
                style={{
                  backgroundColor: isSelected ? theme.soft : theme.cardBg,
                  borderColor: isSelected ? theme.accent : theme.border,
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                }}
              >
                <div
                  className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl"
                  style={{ backgroundColor: theme.accent + "22" }}
                >
                  <Icon
                    size={20}
                    style={{ color: theme.accent }}
                  />
                </div>

                <h3 className="mt-3 sm:mt-5 text-xs sm:text-[20px] font-black" style={{ color: theme.text }}>
                  {game.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* ACTIVE GAME */}
        <div
          className="mt-6 sm:mt-10 rounded-[24px] sm:rounded-[36px] p-4 sm:p-8 shadow-xs border transition-colors duration-500"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <h2 className="text-xl sm:text-[34px] font-black" style={{ color: theme.text }}>
            {games[activeGame].title}
          </h2>

          {games[activeGame].content}
        </div>
      </main>
    </div>
  );
}

export default Games;
