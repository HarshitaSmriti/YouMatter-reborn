import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Mail,
  MessageCircleHeart,
  MoonStar,
} from "lucide-react";
import { useMood } from "../context/MoodContext";

function Support() {
  const navigate = useNavigate();
  const { theme } = useMood();

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
              Emotional Support Space
            </p>

            <h1 className="mt-0.5 text-xl font-extrabold sm:text-3xl lg:text-4xl tracking-tight" style={{ color: theme.text }}>
              You Are Not Alone
            </h1>
          </div>
        </div>

        {/* HERO */}
        <div
          className="relative mt-4 sm:mt-8 overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-8 border shadow-xs transition-colors duration-500"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <div className="absolute left-10 top-10 h-52 w-52 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: theme.accent }} />
          <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: theme.accent }} />

          <div className="relative z-10 max-w-[800px]">
            <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-xl" style={{ backgroundColor: theme.accent + "22" }}>
              <HeartHandshake
                size={20}
                style={{ color: theme.accent }}
              />
            </div>

            <h2 className="mt-3 sm:mt-6 text-xl font-extrabold leading-tight sm:text-4xl tracking-tight" style={{ color: theme.text }}>
              A gentle space for difficult moments
            </h2>

            <p className="mt-2 sm:mt-4 max-w-[650px] text-xs sm:text-sm font-medium leading-relaxed" style={{ color: theme.subtext }}>
              Support isn’t weakness. Sometimes we just need someone to listen, guide and remind us that healing takes time.
            </p>

            <div className="mt-4 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => navigate("/chat")}
                className="rounded-xl px-4 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-95"
                style={{ backgroundColor: theme.accent }}
              >
                Talk To Someone
              </button>

              <button
                onClick={() => window.scrollTo({ top: 500, behavior: "smooth" })}
                className="rounded-xl border px-4 py-2.5 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-bold shadow-xs transition hover:opacity-90 active:scale-95"
                style={{ backgroundColor: theme.soft, borderColor: theme.border, color: theme.text }}
              >
                Crisis Resources
              </button>
            </div>
          </div>
        </div>

        {/* SUPPORT OPTIONS */}
        <div className="mt-6 sm:mt-10 grid gap-4 lg:grid-cols-3">
          {/* CARD 1 */}
          <div
            className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border transition-colors duration-500"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.accent + "22" }}>
              <Phone
                size={30}
                style={{ color: theme.accent }}
              />
            </div>

            <h3 className="mt-6 text-[30px] font-black" style={{ color: theme.text }}>
              Emergency Help
            </h3>

            <p className="mt-4 text-[15px] leading-8 font-medium" style={{ color: theme.subtext }}>
              If things feel overwhelming, connect to immediate support and trusted emergency contacts.
            </p>

            <button
              onClick={() => navigate("/chat")}
              className="mt-8 rounded-2xl px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 active:scale-95 shadow-xs"
              style={{ backgroundColor: theme.accent }}
            >
              Get Help
            </button>
          </div>

          {/* CARD 2 */}
          <div
            className="rounded-[36px] p-7 shadow-xs border transition-colors duration-500"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.accent + "22" }}>
              <MessageCircleHeart
                size={30}
                style={{ color: theme.accent }}
              />
            </div>

            <h3 className="mt-6 text-[30px] font-black" style={{ color: theme.text }}>
              Safe Conversations
            </h3>

            <p className="mt-4 text-[15px] leading-8 font-medium" style={{ color: theme.subtext }}>
              Reach out privately and express your feelings without fear of judgment.
            </p>

            <button
              onClick={() => navigate("/chat")}
              className="mt-8 rounded-2xl px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 active:scale-95 shadow-xs"
              style={{ backgroundColor: theme.accent }}
            >
              Start Talking
            </button>
          </div>

          {/* CARD 3 */}
          <div
            className="rounded-[36px] p-7 shadow-xs border transition-colors duration-500"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.accent + "22" }}>
              <ShieldCheck
                size={30}
                style={{ color: theme.accent }}
              />
            </div>

            <h3 className="mt-6 text-[30px] font-black" style={{ color: theme.text }}>
              Private & Secure
            </h3>

            <p className="mt-4 text-[15px] leading-8 font-medium" style={{ color: theme.subtext }}>
              Your emotions, reflections and support sessions stay protected and confidential.
            </p>

            <button
              onClick={() => navigate("/settings")}
              className="mt-8 rounded-2xl px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 active:scale-95 shadow-xs"
              style={{ backgroundColor: theme.accent }}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* SELF CARE SECTION */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* LEFT */}
          <div
            className="rounded-[36px] p-8 border shadow-xs transition-colors duration-500"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.accent + "22" }}>
              <MoonStar
                size={30}
                style={{ color: theme.accent }}
              />
            </div>

            <h3 className="mt-6 text-[34px] font-black" style={{ color: theme.text }}>
              Tonight’s Reminder
            </h3>

            <p className="mt-5 text-[16px] leading-9 font-medium" style={{ color: theme.subtext }}>
              Rest is productive.
              <br />
              Healing is not linear.
              <br />
              You are allowed to pause.
              <br />
              Small progress still matters.
            </p>
          </div>

          {/* RIGHT */}
          <div
            className="rounded-[36px] p-8 border shadow-xs transition-colors duration-500"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.accent + "22" }}>
              <Mail
                size={30}
                style={{ color: theme.accent }}
              />
            </div>

            <h3 className="mt-6 text-[34px] font-black" style={{ color: theme.text }}>
              Reach Out
            </h3>

            <p className="mt-5 text-[16px] leading-8 font-medium" style={{ color: theme.subtext }}>
              Save a trusted person you can contact whenever things feel emotionally overwhelming.
            </p>

            <div className="mt-8 rounded-3xl p-5 border" style={{ backgroundColor: theme.soft, borderColor: theme.border }}>
              <p className="text-sm font-semibold" style={{ color: theme.accent }}>
                Trusted Contact
              </p>

              <h4 className="mt-2 text-[22px] font-black" style={{ color: theme.text }}>
                Someone who makes you feel safe
              </h4>

              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Enter name"
                  className="w-full rounded-2xl px-5 py-4 outline-none font-medium transition-all"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderWidth: "1px", color: theme.text }}
                />

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  className="w-full rounded-2xl px-5 py-4 outline-none font-medium transition-all"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderWidth: "1px", color: theme.text }}
                />

                <a
                  href="tel:14416"
                  className="flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-bold text-white transition hover:opacity-90 active:scale-95 shadow-xs"
                  style={{ backgroundColor: theme.accent }}
                >
                  Call Helpline (14416)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER MESSAGE */}
        <div
          className="mt-10 rounded-[36px] p-8 text-center shadow-xs border transition-colors duration-500"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px]" style={{ backgroundColor: theme.accent + "22" }}>
            <Sparkles
              size={36}
              style={{ color: theme.accent }}
            />
          </div>

          <h2 className="mt-8 text-[40px] font-black" style={{ color: theme.text }}>
            One step at a time
          </h2>

          <p className="mx-auto mt-5 max-w-[700px] text-[16px] leading-8 font-medium" style={{ color: theme.subtext }}>
            You don’t need to have everything figured out today. Breathe slowly, take care of yourself gently and keep moving forward little by little.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Support;