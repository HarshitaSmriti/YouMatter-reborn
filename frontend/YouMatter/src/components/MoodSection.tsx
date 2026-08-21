// MoodSection.tsx

import HappyMood from "../assets/illustrations/HappyMood.svg";
import CalmMood from "../assets/illustrations/CalmMood.svg";
import SadMood from "../assets/illustrations/SadMood.svg";
import AnxiousMood from "../assets/illustrations/AnxiousMood.svg";
import FocusedMood from "../assets/illustrations/FocusedMood.svg";
import TiredMood from "../assets/illustrations/TiredMood.svg";

const moods = [
  {
    name: "Happy",
    icon: HappyMood,
    bg: "bg-[#ffeef5]",
  },
  {
    name: "Calm",
    icon: CalmMood,
    bg: "bg-[#f2ebff]",
  },
  {
    name: "Sad",
    icon: SadMood,
    bg: "bg-[#edf4ff]",
  },
  {
    name: "Anxious",
    icon: AnxiousMood,
    bg: "bg-[#fff4ea]",
  },
  {
    name: "Focused",
    icon: FocusedMood,
    bg: "bg-[#e8faf4]",
  },
  {
    name: "Tired",
    icon: TiredMood,
    bg: "bg-[#f4ecff]",
  },
];

function MoodSection() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {moods.map((mood) => (
        <button
          key={mood.name}
          className={`${mood.bg} flex flex-col items-center justify-center rounded-[24px] p-4 transition hover:-translate-y-1`}
        >
          <img
            src={mood.icon}
            alt={mood.name}
            className="h-10 w-10"
          />

          <p className="mt-3 text-sm font-bold text-[#241b43]">
            {mood.name}
          </p>
        </button>
      ))}
    </div>
  );
}

export default MoodSection;