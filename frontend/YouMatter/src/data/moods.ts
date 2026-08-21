import HappyMood from "../assets/illustrations/HappyMood.svg";
import CalmMood from "../assets/illustrations/CalmMood.svg";
import SadMood from "../assets/illustrations/SadMood.svg";
import AnxiousMood from "../assets/illustrations/AnxiousMood.svg";
import FocusedMood from "../assets/illustrations/FocusedMood.svg";
import TiredMood from "../assets/illustrations/TiredMood.svg";

const moods = [
  {
    id: 1,
    title: "Happy",
    subtitle: "Feeling light & positive",
    image: HappyMood,
    bg: "bg-[#FFE4EF]",
  },
  {
    id: 2,
    title: "Calm",
    subtitle: "Peaceful and relaxed",
    image: CalmMood,
    bg: "bg-[#EEE5FF]",
  },
  {
    id: 3,
    title: "Sad",
    subtitle: "Low energy today",
    image: SadMood,
    bg: "bg-[#DDEBFF]",
  },
  {
    id: 4,
    title: "Anxious",
    subtitle: "Mind feels crowded",
    image: AnxiousMood,
    bg: "bg-[#FFE8D9]",
  },
  {
    id: 5,
    title: "Focused",
    subtitle: "Clear and productive",
    image: FocusedMood,
    bg: "bg-[#DDFBF3]",
  },
  {
    id: 6,
    title: "Tired",
    subtitle: "Need rest and pause",
    image: TiredMood,
    bg: "bg-[#F3E8FF]",
  },
];

export default moods;