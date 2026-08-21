import type { ReactNode } from "react";
import { Heart } from "lucide-react";
import chatbotIllustration from "../assets/chatbot.svg";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

function AuthLayout({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-[#f7f5ff] flex items-center justify-center px-6">
      <div className="w-full max-w-[1200px] grid lg:grid-cols-2 bg-white rounded-[40px] overflow-hidden shadow-2xl">
        {/* LEFT */}
<div className="hidden lg:flex bg-gradient-to-br from-purple-600 to-violet-500 p-14 text-white flex-col justify-between relative overflow-hidden">
  {/* TOP */}
  <div className="relative z-10">
    <div className="flex items-center gap-3 mb-10">
      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
        <Heart size={28} />
      </div>

      <h1 className="text-3xl font-bold">
        YouMatter
      </h1>
    </div>

    <h2 className="text-5xl font-bold leading-tight mb-6 max-w-[500px]">
      Your safe space for mental wellness.
    </h2>

    <p className="text-lg text-purple-100 leading-relaxed max-w-[500px]">
      Talk freely, journal emotions, track mood,
      and heal with guided exercises.
    </p>
  </div>

  {/* ILLUSTRATION */}
  <div className="relative z-10 flex justify-center">
    <img
      src={chatbotIllustration}
      alt="Mental wellness illustration"
      className="w-[420px] drop-shadow-2xl"
    />
  </div>

  {/* GLOW */}
  <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl bottom-[-150px] right-[-100px]"></div>
</div>

        {/* RIGHT */}
        <div className="p-8 lg:p-16 flex items-center">
          <div className="w-full">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              {title}
            </h2>

            <p className="text-gray-500 mb-10">
              {subtitle}
            </p>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;