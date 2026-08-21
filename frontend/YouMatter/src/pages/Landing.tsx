import { useState, useEffect } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Heart,
  Menu,
  Send,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import chatbotIllustration from "../assets/chatbot.svg";
import landingData from "../data/landingData";
import { Link, useNavigate } from "react-router-dom";

const toneClasses: Record<string, string> = {
  purple: "bg-[#6d4df2] text-white",
  pink: "bg-[#ffe6f1] text-[#f25b9a]",
  green: "bg-[#dcf8d1] text-[#56b84d]",
  blue: "bg-[#e4f0ff] text-[#2e84e6]",
  amber: "bg-[#fff2cf] text-[#e5a018]",
};

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3"
    >
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#6548ee] text-white shadow-[0_10px_25px_rgba(101,72,238,0.22)]">
        <Heart
          size={22}
          fill="currentColor"
        />
      </div>

      <h1 className="text-[1.9rem] font-black text-[#5d41ef]">
        {landingData.navbar.logo}
      </h1>
    </Link>
  );
}

function ChatPreview() {
  return (
    <div className="relative z-20 w-full max-w-[430px] rounded-[34px] border border-[#ece8ff] bg-white p-6 shadow-[0_20px_60px_rgba(36,33,68,0.1)]">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#6548ee] text-white">
            <Heart
              size={21}
              fill="currentColor"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[18px] font-bold text-[#111827]">
                YouMatter AI
              </h3>

              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
            </div>

            <p className="text-[13px] text-[#7d86a2]">
              Online
            </p>
          </div>
        </div>

        <button className="text-[#9d8cff]">
          <Settings size={20} />
        </button>
      </div>

      {/* CHATS */}
      <div className="space-y-4">
        {landingData.hero.previewMessages.map(
          (message) => (
            <div
              key={message.text}
              className={`w-fit rounded-[24px] px-5 py-4 ${
                message.type === "bot"
                  ? "ml-auto max-w-[280px] bg-[#a855f7] text-white"
                  : "max-w-[250px] border border-[#eceef6] bg-[#f8f8fb] text-[#151936]"
              }`}
            >
              <p className="text-[15px] leading-7">
                {message.text}
              </p>

              <p
                className={`mt-2 text-right text-[10px] ${
                  message.type === "bot"
                    ? "text-white/75"
                    : "text-[#9aa3ba]"
                }`}
              >
                {message.time}
              </p>
            </div>
          )
        )}
      </div>

      {/* INPUT */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#e5e7f0] bg-[#fafafe] px-4 py-3">
        <span className="flex-1 text-[14px] text-[#9ca3bb]">
          Type your message...
        </span>

        <button className="grid h-9 w-9 place-items-center rounded-xl bg-[#f1edff] text-[#a855f7]">
          <Send
            size={17}
            fill="currentColor"
          />
        </button>
      </div>

      {/* NAV */}
      <div className="mt-5 grid grid-cols-5 text-center text-[11px] font-medium text-[#7d86a2]">
        {[
          ["Chat", Bot],
          ["Journal", UserRound],
          ["Exercises", CheckCircle2],
          ["Mood", Heart],
          ["Profile", UserRound],
        ].map(([label, Icon]) => (
          <div
            key={label as string}
            className="flex flex-col items-center gap-2"
          >
            <Icon
              size={16}
              className={
                label === "Chat"
                  ? "text-[#a855f7]"
                  : "text-[#96a0bc]"
              }
            />

            <span>{label as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ContactIcon = landingData.contact.icon;

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaff] text-[#090d2c]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#fbfaff]/90 backdrop-blur-md">
        <nav className="mx-auto flex h-20 lg:h-24 max-w-[1380px] items-center justify-between px-6 lg:px-10">
          <Logo />

          {/* LINKS */}
          <div className="hidden items-center gap-11 lg:flex">
            {landingData.navbar.links.map(
              (link, index) => (
                <a
                  key={link.name}
                  href={link.path}
                  className={`relative text-[15px] font-semibold transition ${
                    index === 0
                      ? "text-[#a855f7]"
                      : "text-[#1b213f] hover:text-[#6548ee]"
                  }`}
                >
                  {link.name}

                  {index === 0 && (
                    <span className="absolute -bottom-3 left-0 h-[2px] w-full rounded-full bg-[#6548ee]" />
                  )}
                </a>
              )
            )}
          </div>

          {/* ACTIONS */}
          <div className="hidden items-center gap-5 lg:flex">
            <Link
                to="/login"
                className="text-[15px] font-semibold text-[#151936]"
            >
            Log in
            </Link>

            <Link
              to="/login"
              className="rounded-xl bg-[#6548ee] px-5 py-3 text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(101,72,238,0.22)] transition hover:bg-[#5a3cec]"
            >
              {landingData.navbar.buttonText}
            </Link>
          </div>

          {/* MOBILE BURGER TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-[#e7e5f7] bg-white lg:hidden text-[#1b213f] transition active:scale-95"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* MOBILE BURGER MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="border-b border-[#ece8ff] bg-white/98 px-6 py-6 shadow-xl lg:hidden">
            <div className="flex flex-col gap-4">
              {landingData.navbar.links.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[16px] font-bold text-[#1b213f] hover:text-[#6548ee]"
                >
                  {link.name}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3 border-t border-[#f0ebff] pt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl border border-[#e7e5f7] py-3 text-[15px] font-bold text-[#151936]"
                >
                  Log in
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-[#6548ee] py-3 text-[15px] font-bold text-white shadow-md"
                >
                  {landingData.navbar.buttonText}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative mx-auto grid min-h-[calc(100vh-96px)] max-w-[1380px] grid-cols-1 items-center gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1fr_1fr] lg:px-10">
        {/* LEFT */}
        <div className="relative z-20">
          {/* BADGE */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#ddd5ff] bg-[#f2edff] px-5 py-2.5 text-[14px] font-semibold text-[#6548ee]">
            ✦ {landingData.hero.badge}
          </div>

          {/* HEADING */}
          <h1 className="max-w-[650px] text-[clamp(3.3rem,7vw,5.7rem)] font-black leading-[1.02] text-[#060b2d]">
            {landingData.hero.titleLine1}
            <br />

            {landingData.hero.titleLine2}
            <br />

            <span className="text-[#6548ee]">
              {landingData.hero.highlight}
            </span>
          </h1>

          {/* DESC */}
          <p className="mt-7 max-w-[620px] text-[19px] leading-[42px] text-[#4f5875]">
            {landingData.hero.description}
          </p>

          {/* BENEFITS */}
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-5">
            {landingData.hero.quickBenefits.map(
              (benefit) => (
                <span
                  key={benefit}
                  className="flex items-center gap-2 text-[15px] font-semibold text-[#303750]"
                >
                  <CheckCircle2
                    size={18}
                    className="text-[#6548ee]"
                  />

                  {benefit}
                </span>
              )
            )}
          </div>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-wrap gap-5">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#6548ee] px-7 py-4 text-[17px] font-bold text-white shadow-[0_18px_34px_rgba(101,72,238,0.2)] transition hover:bg-[#5a3cec]"
            >
              Start Your Journey

              <ArrowRight size={19} />
            </Link>

            <a
              href="#features"
              className="inline-flex items-center gap-3 rounded-2xl border border-[#dfe2ee] bg-white px-7 py-4 text-[17px] font-bold text-[#111735] transition hover:border-[#c9c1ff]"
            >
              Explore Features

              <Send
                size={17}
                fill="currentColor"
              />
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative flex min-h-[650px] items-center justify-center">
          {/* GLOW */}
          <div className="absolute h-[500px] w-[500px] rounded-full bg-[#f0ebff] blur-3xl" />

          {/* DECOR */}
          <div className="absolute right-10 top-6 hidden h-32 w-36 rounded-t-full bg-[#ece4ff] lg:block" />

          <div className="absolute left-16 top-44 text-3xl text-[#d8ccff]">
            ✦
          </div>

          <div className="absolute right-[18%] top-48 text-3xl text-[#d8ccff]">
            ✦
          </div>

          {/* CHAT */}
          <div className="absolute left-0 top-16 z-20">
            <ChatPreview />
          </div>

          {/* SVG */}
          <div className="absolute bottom-[10px] right-[-20px] z-10 w-[350px]">
            <img
              src={chatbotIllustration}
              alt="Mental wellness illustration"
              className="w-full object-contain opacity-95"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto max-w-[1380px] px-6 py-20 lg:px-10"
      >
        <div className="text-center">
          <h2 className="text-[40px] font-black text-[#090d2c]">
            Everything you need for your mental well-being
          </h2>

          <p className="mx-auto mt-4 max-w-[680px] text-[18px] leading-8 text-[#5c6480]">
            Powerful tools and compassionate support,
            all in one place.
          </p>
        </div>

        {/* CARDS */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {landingData.features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-[28px] border border-[#eceef6] bg-white p-7 shadow-[0_16px_42px_rgba(36,33,68,0.06)] transition hover:-translate-y-2 hover:shadow-[0_22px_55px_rgba(36,33,68,0.1)]"
              >
                <div
                  className={`mb-6 grid h-14 w-14 place-items-center rounded-2xl ${toneClasses[feature.tone]}`}
                >
                  <Icon size={26} />
                </div>

                <h3 className="text-[20px] font-black text-[#0f1431]">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-8 text-[#4f5875]">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-[1380px] px-6 py-20 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-bold text-[#6548ee]">
              How It Works
            </p>

            <h2 className="mt-4 text-[42px] font-black leading-tight text-[#090d2c]">
              A calmer way to talk through hard moments.
            </h2>

            <p className="mt-6 text-[18px] leading-8 text-[#5c6480]">
              YouMatter helps people express
              emotions, journal thoughts, track
              moods, and feel emotionally supported.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {landingData.steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="rounded-[28px] border border-[#eceef6] bg-white p-7 shadow-[0_16px_42px_rgba(36,33,68,0.06)]"
                >
                  <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1edff] font-black text-[#6548ee]">
                    {index + 1}
                  </span>

                  <Icon
                    size={25}
                    className="mb-5 text-[#6548ee]"
                  />

                  <h3 className="text-[20px] font-black text-[#111827]">
                    {step.title}
                  </h3>

                  <p className="mt-4 leading-8 text-[#5c6480]">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-[1380px] px-6 py-20 lg:px-10">
        <div className="grid gap-10 rounded-[36px] border border-[#ece8ff] bg-[#f5f2ff] p-8 lg:grid-cols-[1fr_0.9fr] lg:p-12">
          <div>
            <p className="font-bold text-[#6548ee]">
              About Us
            </p>

            <h2 className="mt-4 text-[42px] font-black leading-tight text-[#090d2c]">
              Built for support, not judgment.
            </h2>

            <p className="mt-6 text-[18px] leading-8 text-[#4f5875]">
              YouMatter is a calm AI-powered mental
              wellness companion designed to help
              people feel emotionally safe and heard.
            </p>
          </div>

          <div className="grid gap-5">
            {landingData.safeguards.map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-2xl bg-white px-6 py-5 font-bold text-[#222944] shadow-sm"
              >
                <CheckCircle2
                  size={21}
                  className="text-[#6548ee]"
                />

                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="mx-auto max-w-[1380px] px-6 pb-20 pt-10 lg:px-10"
      >
        <div className="grid gap-10 rounded-[36px] bg-[#15123b] p-8 text-white shadow-[0_24px_70px_rgba(21,18,59,0.18)] lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
          <div className="flex gap-5">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#d4cbff]">
              <ContactIcon size={30} />
            </span>

            <div>
              <h2 className="text-[38px] font-black">
                {landingData.contact.title}
              </h2>

              <p className="mt-5 max-w-[700px] text-[18px] leading-8 text-white/75">
                {landingData.contact.description}
              </p>
            </div>
          </div>

          <a
            href="mailto:hello@youmatter.ai"
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-[17px] font-black text-[#15123b] transition hover:bg-[#f1edff]"
          >
            Contact Us

            <ArrowRight size={19} />
          </a>
        </div>
      </section>
    </main>
  );
}

export default Landing;