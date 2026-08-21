import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Moon,
  Shield,
  Volume2,
  Heart,
  Lock,
  Smartphone,
} from "lucide-react";
import { useMood } from "../context/MoodContext";

function Settings() {
  const navigate = useNavigate();
  const { theme, isDarkMode, setDarkMode } = useMood();

  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [calmReminders, setCalmReminders] = useState(true);
  const [userName, setUserName] = useState<string>(() => {
    return (
      localStorage.getItem("youmatter_user_name") ||
      localStorage.getItem("userName") ||
      "Guest User"
    );
  });

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  return (
    <div
      className="flex min-h-screen flex-col lg:flex-row transition-colors duration-500"
      style={{ backgroundColor: theme.pageBg }}
    >
      <Sidebar />

      <main className="flex-1 px-4 py-6 sm:px-8">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/home")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border shadow-xs transition hover:opacity-80 active:scale-95"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <ArrowLeft
              size={18}
              style={{ color: theme.accent }}
            />
          </button>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
              Preferences & Privacy
            </p>

            <h1
              className="mt-1 text-[36px] font-black sm:text-[48px] transition-colors duration-500 tracking-tight"
              style={{ color: theme.text }}
            >
              Settings
            </h1>
          </div>
        </div>

        {/* PROFILE */}
        <div
          className="mt-8 rounded-[32px] p-8 border shadow-xs transition-all duration-500"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full font-black text-3xl text-white shadow-md transition-colors duration-500"
              style={{ backgroundColor: theme.accent }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2
                className="text-[32px] font-black sm:text-[40px] tracking-tight transition-colors duration-500"
                style={{ color: theme.text }}
              >
                {userName}
              </h2>

              <p className="mt-1 text-sm font-semibold" style={{ color: theme.subtext }}>
                Your safe mental wellness journey
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-2xl px-5 py-3 text-xs font-bold text-white shadow-xs transition hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: theme.accent }}
                >
                  Edit Profile
                </button>

                <button
                  className="rounded-2xl border px-5 py-3 text-xs font-bold transition hover:opacity-90 active:scale-95 shadow-xs"
                  style={{ backgroundColor: theme.soft, borderColor: theme.border, color: theme.text }}
                >
                  Account Security
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SETTINGS GRID */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* NOTIFICATIONS */}
          <div
            className="rounded-[36px] p-7 shadow-xs border transition-colors duration-500"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.accent + "22" }}
              >
                <Bell size={30} style={{ color: theme.accent }} />
              </div>

              <div>
                <h3 className="text-[28px] font-black" style={{ color: theme.text }}>
                  Notifications
                </h3>
                <p className="text-sm font-medium" style={{ color: theme.subtext }}>
                  Manage reminder alerts
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <div
                className="flex items-center justify-between rounded-3xl p-5 border"
                style={{ backgroundColor: theme.soft, borderColor: theme.border }}
              >
                <div>
                  <p className="font-bold" style={{ color: theme.text }}>
                    Push Notifications
                  </p>
                  <p className="mt-1 text-sm font-medium" style={{ color: theme.subtext }}>
                    Receive wellness updates
                  </p>
                </div>

                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`h-8 w-16 rounded-full transition p-1 ${
                    notifications ? "opacity-100" : "opacity-50"
                  }`}
                  style={{ backgroundColor: notifications ? theme.accent : theme.border }}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white transition-transform ${
                      notifications ? "translate-x-8" : ""
                    }`}
                  />
                </button>
              </div>

              <div
                className="flex items-center justify-between rounded-3xl p-5 border"
                style={{ backgroundColor: theme.soft, borderColor: theme.border }}
              >
                <div>
                  <p className="font-bold" style={{ color: theme.text }}>
                    Calm Reminders
                  </p>
                  <p className="mt-1 text-sm font-medium" style={{ color: theme.subtext }}>
                    Gentle breathing reminders
                  </p>
                </div>

                <button
                  onClick={() => setCalmReminders(!calmReminders)}
                  className={`h-8 w-16 rounded-full transition p-1 ${
                    calmReminders ? "opacity-100" : "opacity-50"
                  }`}
                  style={{ backgroundColor: calmReminders ? theme.accent : theme.border }}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white transition-transform ${
                      calmReminders ? "translate-x-8" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* APPEARANCE */}
          <div
            className="rounded-[36px] p-7 shadow-xs border transition-colors duration-500"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.accent + "22" }}
              >
                <Moon size={30} style={{ color: theme.accent }} />
              </div>

              <div>
                <h3 className="text-[28px] font-black" style={{ color: theme.text }}>
                  Appearance
                </h3>
                <p className="text-sm font-medium" style={{ color: theme.subtext }}>
                  Customize your experience
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <div
                className="flex items-center justify-between rounded-3xl p-5 border"
                style={{ backgroundColor: theme.soft, borderColor: theme.border }}
              >
                <div>
                  <p className="font-bold" style={{ color: theme.text }}>
                    Dark Mode
                  </p>
                  <p className="mt-1 text-sm font-medium" style={{ color: theme.subtext }}>
                    Reduce eye strain at night
                  </p>
                </div>

                <button
                  onClick={toggleDarkMode}
                  className={`h-8 w-16 rounded-full transition p-1 ${
                    isDarkMode ? "opacity-100" : "opacity-50"
                  }`}
                  style={{ backgroundColor: isDarkMode ? theme.accent : theme.border }}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white transition-transform ${
                      isDarkMode ? "translate-x-8" : ""
                    }`}
                  />
                </button>
              </div>

              <div
                className="flex items-center justify-between rounded-3xl p-5 border"
                style={{ backgroundColor: theme.soft, borderColor: theme.border }}
              >
                <div>
                  <p className="font-bold" style={{ color: theme.text }}>
                    Sound Effects
                  </p>
                  <p className="mt-1 text-sm font-medium" style={{ color: theme.subtext }}>
                    Calm interaction sounds
                  </p>
                </div>

                <button
                  onClick={() => setSound(!sound)}
                  className={`h-8 w-16 rounded-full transition p-1 ${
                    sound ? "opacity-100" : "opacity-50"
                  }`}
                  style={{ backgroundColor: sound ? theme.accent : theme.border }}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white transition-transform ${
                      sound ? "translate-x-8" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* PRIVACY */}
          <div
            className="rounded-[36px] p-7 shadow-xs border transition-colors duration-500"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.accent + "22" }}
              >
                <Shield size={30} style={{ color: theme.accent }} />
              </div>

              <div>
                <h3 className="text-[28px] font-black" style={{ color: theme.text }}>
                  Privacy
                </h3>
                <p className="text-sm font-medium" style={{ color: theme.subtext }}>
                  Your data & protection
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div
                className="rounded-3xl p-5 border"
                style={{ backgroundColor: theme.soft, borderColor: theme.border }}
              >
                <div className="flex items-center gap-3">
                  <Lock size={20} style={{ color: theme.accent }} />
                  <p className="font-bold" style={{ color: theme.text }}>
                    End-to-End Encryption
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 font-medium" style={{ color: theme.subtext }}>
                  Your journals and conversations stay private and secure.
                </p>
              </div>

              <div
                className="rounded-3xl p-5 border"
                style={{ backgroundColor: theme.soft, borderColor: theme.border }}
              >
                <div className="flex items-center gap-3">
                  <Smartphone size={20} style={{ color: theme.accent }} />
                  <p className="font-bold" style={{ color: theme.text }}>
                    Device Access
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 font-medium" style={{ color: theme.subtext }}>
                  Manage login sessions and connected devices.
                </p>
              </div>
            </div>
          </div>

          {/* WELLNESS */}
          <div
            className="rounded-[36px] p-7 shadow-xs border transition-colors duration-500"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.accent + "22" }}
              >
                <Heart size={30} style={{ color: theme.accent }} />
              </div>

              <div>
                <h3 className="text-[28px] font-black" style={{ color: theme.text }}>
                  Wellness Preferences
                </h3>
                <p className="text-sm font-medium" style={{ color: theme.subtext }}>
                  Personalize your calm space
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div
                className="rounded-3xl p-5 border"
                style={{ backgroundColor: theme.soft, borderColor: theme.border }}
              >
                <p className="font-bold" style={{ color: theme.text }}>
                  Daily Motivation
                </p>
                <p className="mt-3 text-sm leading-7 font-medium" style={{ color: theme.subtext }}>
                  Receive gentle reminders and emotional encouragement throughout the day.
                </p>
              </div>

              <div
                className="rounded-3xl p-5 border"
                style={{ backgroundColor: theme.soft, borderColor: theme.border }}
              >
                <p className="font-bold" style={{ color: theme.text }}>
                  Calm Sounds
                </p>
                <p className="mt-3 text-sm leading-7 font-medium" style={{ color: theme.subtext }}>
                  Enable relaxing ambient sounds during breathing exercises and games.
                </p>
              </div>

              <div
                className="rounded-3xl p-5 border"
                style={{ backgroundColor: theme.soft, borderColor: theme.border }}
              >
                <div className="flex items-center gap-3">
                  <Volume2 size={20} style={{ color: theme.accent }} />
                  <p className="font-bold" style={{ color: theme.text }}>
                    Soft Interaction Audio
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 font-medium" style={{ color: theme.subtext }}>
                  Gentle sounds when interacting with the app experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;