import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Heart } from "lucide-react";
import supabase from "../config/supabaseClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback`,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setMessage("Password reset link sent! Please check your email inbox.");
      }
    } catch (err: any) {
      setErrorMsg("Failed to send reset link. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbfaff] flex items-center justify-center px-6">
      {/* CARD */}
      <div className="w-full max-w-[480px] rounded-[36px] bg-white border border-[#ece8ff] p-8 shadow-[0_20px_60px_rgba(124,77,255,0.12)]">
        
        {/* TOP */}
        <div className="flex items-center justify-between mb-10">
          <Link
            to="/login"
            className="flex items-center gap-2 text-[#7c4dff] font-semibold hover:opacity-80 transition"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#7c4dff] text-white shadow-[0_10px_25px_rgba(124,77,255,0.25)]">
            <Heart
              size={24}
              fill="currentColor"
            />
          </div>
        </div>

        {/* HEADING */}
        <h1 className="text-[40px] leading-tight font-black text-[#16122f]">
          Forgot
          <br />
          Password?
        </h1>

        <p className="mt-5 text-[17px] leading-8 text-[#6b6880]">
          Don’t worry. Enter your registered email
          and we’ll send you a password reset link.
        </p>

        {errorMsg && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* FORM */}
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div>
            <label className="block mb-3 font-semibold text-[#2c2747]">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9d94c5]"
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-2xl border border-[#e9e4ff] bg-[#faf7ff] py-4 pl-14 pr-5 outline-none transition focus:border-[#7c4dff]"
                required
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#7c4dff] py-4 text-lg font-bold text-white shadow-[0_18px_34px_rgba(124,77,255,0.2)] transition hover:bg-[#7042f5] disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-8 text-center text-[#7f7998]">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#7c4dff]"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default ForgotPassword;