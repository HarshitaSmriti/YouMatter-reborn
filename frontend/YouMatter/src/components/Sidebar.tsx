import { useState, useEffect } from "react";
import {
  House,
  MessageCircle,
  BookOpen,
  Activity,
  Wind,
  Puzzle,
  HeartHandshake,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { useMood } from "../context/MoodContext";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { name: "Home", icon: House, path: "/home" },
  { name: "AI Chat", icon: MessageCircle, path: "/chat" },
  { name: "Journal", icon: BookOpen, path: "/journal" },
  { name: "Mood Tracker", icon: Activity, path: "/mood" },
  { name: "Breathing", icon: Wind, path: "/breathing" },
  { name: "Games", icon: Puzzle, path: "/games" },
  { name: "Support", icon: HeartHandshake, path: "/support" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

function Sidebar() {
  const navigate = useNavigate();
  const { theme } = useMood();
  const { signOut: authSignOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState<string>(() => {
    return (
      localStorage.getItem("youmatter_user_name") ||
      localStorage.getItem("userName") ||
      "Friend"
    );
  });

  useEffect(() => {
    const initUser = async () => {
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
    initUser();
  }, []);

  const handleSignOut = async () => {
    await authSignOut();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <header
        className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md lg:hidden transition-colors duration-500"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
      >
        <div className="flex items-center gap-3">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl text-white transition-colors duration-500 shadow-xs"
            style={{ backgroundColor: theme.accent }}
          >
            <Heart size={18} fill="currentColor" />
          </div>
          <span
            className="text-xl font-black transition-colors duration-500 tracking-tight"
            style={{ color: theme.accent }}
          >
            YouMatter
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border transition shadow-xs"
          style={{ backgroundColor: theme.soft, borderColor: theme.border, color: theme.text }}
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <aside
            className="relative flex h-full max-h-screen w-[285px] max-w-[85vw] flex-col justify-between overflow-y-auto px-5 py-6 shadow-2xl backdrop-blur-xl transition-colors duration-500"
            style={{ backgroundColor: theme.cardBg }}
          >
            <div>
              {/* Header */}
              <div
                className="flex items-center justify-between pb-6 border-b"
                style={{ borderColor: theme.border }}
              >
                <div>
                  <h1
                    className="text-2xl font-black transition-colors duration-500 tracking-tight"
                    style={{ color: theme.accent }}
                  >
                    YouMatter
                  </h1>
                  <p className="text-xs font-medium" style={{ color: theme.subtext }}>Your safe mental space</p>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition hover:opacity-80"
                  style={{ color: theme.subtext }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="mt-6 flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      style={({ isActive }) =>
                        isActive
                          ? { backgroundColor: theme.accent, color: "#ffffff" }
                          : { color: theme.text }
                      }
                      className={({ isActive }) =>
                        `flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all ${
                          isActive
                            ? "font-bold shadow-md"
                            : "hover:opacity-80"
                        }`
                      }
                    >
                      <Icon size={20} />
                      <span className="text-sm font-semibold">{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* User Profile Footer */}
            <div className="mt-6 border-t pt-4" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-3 rounded-2xl p-3" style={{ backgroundColor: theme.soft }}>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white transition-colors duration-500"
                  style={{ backgroundColor: theme.accent }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold" style={{ color: theme.text }}>
                    {userName}
                  </h3>
                  <p className="text-[11px]" style={{ color: theme.subtext }}>Wellness Journey</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                style={{ backgroundColor: theme.accent, color: "#ffffff" }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition hover:opacity-90 active:scale-95"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside
        className="sticky top-0 hidden h-screen max-h-screen w-[280px] flex-col justify-between overflow-y-auto border-r px-5 py-6 lg:flex shrink-0 transition-colors duration-500 backdrop-blur-xl shadow-xs"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
      >
        {/* LOGO */}
        <div>
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 place-items-center rounded-2xl text-white shadow-md transition-colors duration-500"
              style={{ backgroundColor: theme.accent }}
            >
              <Heart size={20} fill="currentColor" />
            </div>
            <h1
              className="text-[28px] font-black transition-colors duration-500 tracking-tight"
              style={{ color: theme.accent }}
            >
              YouMatter
            </h1>
          </div>
          <p className="mt-1.5 text-xs font-medium" style={{ color: theme.subtext }}>Your safe mental space</p>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-8 flex flex-1 flex-col gap-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                style={({ isActive }) =>
                  isActive
                    ? { backgroundColor: theme.accent, color: "#ffffff" }
                    : { color: theme.text }
                }
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-300 ${
                    isActive
                      ? "font-bold shadow-md scale-[1.02]"
                      : "hover:opacity-80"
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-[15px] font-semibold">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* USER */}
        <div
          className="mt-6 rounded-[24px] p-4 border transition-all duration-500 shadow-xs"
          style={{ backgroundColor: theme.soft, borderColor: theme.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full font-bold text-white shadow-xs transition-colors duration-500"
              style={{ backgroundColor: theme.accent }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className="truncate font-bold text-sm transition-colors duration-500"
                style={{ color: theme.text }}
              >
                {userName}
              </h3>
              <p className="text-[11px] font-medium" style={{ color: theme.subtext }}>Wellness Journey</p>
            </div>
          </div>

          {/* SIGN OUT */}
          <button
            onClick={handleSignOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-95 shadow-xs"
            style={{ backgroundColor: theme.accent }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;