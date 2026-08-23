import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import { BookOpen, Trash2, Plus, ArrowLeft, Leaf, Sun, CloudRain, Flame, Heart, Moon } from "lucide-react";

import { useMood } from "../context/MoodContext";

const MOODS = [
  { id: "calm",     label: "Calm",       Icon: Leaf,      accent: "#10b981", subtitle: "Write with stillness and peace" },
  { id: "happy",    label: "Happy",      Icon: Sun,       accent: "#f59e0b", subtitle: "Capture the joy you feel right now" },
  { id: "sad",      label: "Sad",        Icon: CloudRain, accent: "#6366f1", subtitle: "Let your feelings flow without judgment" },
  { id: "anxious",  label: "Anxious",    Icon: Flame,     accent: "#0ea5e9", subtitle: "Release what weighs on your mind" },
  { id: "grateful", label: "Grateful",   Icon: Heart,     accent: "#ec4899", subtitle: "Note the things you appreciate today" },
  { id: "reflect",  label: "Reflective", Icon: Moon,      accent: "#8b5cf6", subtitle: "Explore your thoughts deeply" },
] as const;

type Mood = (typeof MOODS)[number];

interface JournalEntry {
  id: number;
  title?: string;
  content: string;
  created_at: string;
  mood?: string;
  mood_id?: string;
}

function Journal() {
  const navigate = useNavigate();
  const { theme } = useMood();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [activeMood, setActiveMood] = useState<Mood>(MOODS[5]);

  const fetchJournals = async () => {
    try {
      const res = await api.get("/diary");
      setJournals(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { fetchJournals(); }, []);

  const addJournal = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      await api.post("/diary", {
        title: title.trim(),
        content: content.trim(),
        mood: activeMood.id,
      });
      fetchJournals();
      setTitle("");
      setContent("");
    } catch (err) {
      console.log("Failed to save journal:", err);
    }
  };

  const deleteJournal = async (id: number) => {
    setJournals((prev) => prev.filter((j) => j.id !== id));
    try {
      await api.delete(`/diary/${id}`);
    } catch (err) {
      console.error("Failed to delete journal entry:", err);
      fetchJournals();
    }
  };

  const m = activeMood;

  return (
    <div
      className="flex min-h-screen flex-col lg:flex-row transition-colors duration-500"
      style={{ backgroundColor: theme.pageBg }}
    >
      <Sidebar />

      <main className="flex-1 px-4 py-6 sm:px-8">
        {/* BACK */}
        <button
          onClick={() => navigate("/home")}
          className="mb-6 flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-xs transition hover:opacity-80 active:scale-95"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
        >
          <ArrowLeft size={16} />
          Back to home
        </button>

        {/* HEADER */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
            Personal journal
          </p>
          <h1 className="mt-2 text-[36px] font-black sm:text-[48px] transition-colors duration-500 tracking-tight" style={{ color: theme.text }}>
            Reflect your thoughts
          </h1>
          <p className="mt-3 max-w-[640px] text-[15px] leading-8 font-medium transition-colors duration-500" style={{ color: theme.subtext }}>
            Write freely, organize emotions, and track your mental wellness journey safely.
          </p>
        </div>

        {/* MOOD SELECTOR */}
        <div className="mt-6 flex flex-wrap gap-3">
          {MOODS.map((mood) => {
            const active = mood.id === activeMood.id;
            const { Icon } = mood;
            return (
              <button
                key={mood.id}
                onClick={() => setActiveMood(mood)}
                className="flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  borderColor: active ? mood.accent : theme.border,
                  color: active ? mood.accent : theme.subtext,
                  backgroundColor: active ? mood.accent + "18" : theme.cardBg,
                }}
              >
                <Icon size={15} />
                {mood.label}
              </button>
            );
          })}
        </div>

        {/* CREATE JOURNAL */}
        <div
          className="mt-8 rounded-[28px] p-6 shadow-xs border sm:p-8 transition-all duration-500"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-500"
              style={{ backgroundColor: m.accent + "22" }}
            >
              <BookOpen size={22} style={{ color: m.accent }} />
            </div>
            <div>
              <h2 className="text-[22px] font-black" style={{ color: theme.text }}>New journal entry</h2>
              <p className="text-sm font-semibold" style={{ color: m.accent }}>{m.subtitle}</p>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <input
              type="text"
              placeholder="Journal title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl px-5 py-4 outline-none transition-all duration-300 font-medium"
              style={{ backgroundColor: theme.soft, border: `1.5px solid ${theme.border}`, color: theme.text }}
            />
            <textarea
              placeholder="Write your thoughts here..."
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-3xl px-5 py-5 outline-none transition-all duration-300 font-medium"
              style={{ backgroundColor: theme.soft, border: `1.5px solid ${theme.border}`, color: theme.text }}
            />
            <button
              onClick={addJournal}
              className="flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold text-white transition-all duration-300 hover:opacity-90 active:scale-95 shadow-xs"
              style={{ backgroundColor: theme.accent }}
            >
              <Plus size={16} />
              Save journal
            </button>
          </div>
        </div>

        {/* JOURNAL LIST */}
        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
            Recent entries
          </p>
          <h2 className="mt-2 text-[28px] font-black" style={{ color: theme.text }}>Your journal</h2>

          {journals.length === 0 ? (
            <div
              className="mt-6 flex flex-col items-center justify-center rounded-[28px] px-6 py-20 text-center shadow-xs border transition-colors duration-500"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-[24px] transition-colors duration-500"
                style={{ backgroundColor: theme.soft }}
              >
                <BookOpen size={36} style={{ color: theme.accent }} />
              </div>
              <h3 className="mt-6 text-[26px] font-black" style={{ color: theme.text }}>No journals yet</h3>
              <p className="mt-3 max-w-[460px] text-[15px] leading-8 font-medium" style={{ color: theme.subtext }}>
                Start writing your first reflection and track your emotional journey gently.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {journals.map((journal) => {
                const entryMood = MOODS.find((x) => x.id === (journal.mood || journal.mood_id)) ?? MOODS[5];
                const { Icon: EntryIcon } = entryMood;
                const displayTitle = journal.title || journal.content?.split("\n\n")[0] || "Untitled Reflection";
                const displayContent = journal.title ? journal.content : (journal.content?.split("\n\n").slice(1).join("\n\n") || journal.content);
                return (
                  <div
                    key={journal.id}
                    className="rounded-[28px] p-6 shadow-xs border transition-all duration-300 hover:shadow-md"
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                      borderLeft: `5px solid ${entryMood.accent}`,
                    }}
                  >
                    {/* TOP */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold" style={{ color: theme.subtext }}>
                          {new Date(journal.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <h3 className="mt-1 text-[20px] font-black" style={{ color: theme.text }}>
                          {displayTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                          style={{ backgroundColor: entryMood.accent + "18", color: entryMood.accent }}
                        >
                          <EntryIcon size={12} />
                          {entryMood.label}
                        </span>
                        <button
                          onClick={() => deleteJournal(journal.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl transition hover:bg-rose-100/50"
                          style={{ color: "#f43f5e" }}
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <p className="mt-4 text-[14px] leading-7 font-medium" style={{ color: theme.subtext }}>
                      {displayContent}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Journal;