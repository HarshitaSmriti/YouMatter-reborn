import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import supabase from "../config/supabaseClient";
import { Eye, EyeOff, AlertCircle, Sparkles, User, X } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Guest name modal state
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        localStorage.setItem("token", data.session.access_token);
        const username =
          data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] ||
          "User";
        localStorage.setItem("userName", username);
        localStorage.setItem("youmatter_user_name", username);

        const hasConsent = localStorage.getItem("consentGiven") === "true";
        navigate(hasConsent ? "/home" : "/consent");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg("Failed to connect. Please verify your Supabase configuration.");
    } finally {
      setLoading(false);
    }
  };

  // OPEN GUEST MODAL OR CHECK DEVICE LIMIT
  const handleOpenGuestModal = () => {
    setErrorMsg("");
    const isGuestLimitReached = localStorage.getItem("youmatter_guest_pass_used") === "true";
    if (isGuestLimitReached) {
      setErrorMsg("Sorry, you hit your guest limit! Please sign up or log in to continue your mental wellness journey.");
      return;
    }
    setGuestModalOpen(true);
  };

  // CONFIRM GUEST LOGIN WITH CUSTOM NAME
  const confirmGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = guestNameInput.trim() || "Guest User";
    localStorage.setItem("token", `demo-guest-token-${Date.now()}`);
    localStorage.setItem("userName", finalName);
    localStorage.setItem("youmatter_user_name", finalName);
    localStorage.setItem("youmatter_guest_pass_used", "true");
    setGuestModalOpen(false);
    navigate("/home");
  };

  // GOOGLE LOGIN
  const signInWithGoogle = async () => {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setErrorMsg(error.message);
    } catch (err: any) {
      setErrorMsg("Google Sign-In failed. Please check your Supabase OAuth setup.");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Login to continue your wellness journey."
    >
      <form className="space-y-6" onSubmit={handleLogin}>
        {/* ERROR ALERT BANNER */}
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle size={20} className="shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1 font-semibold">{errorMsg}</div>
          </div>
        )}

        {/* EMAIL */}
        <div>
          <label className="mb-2 block font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            required
          />
        </div>

        {/* PASSWORD */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="font-medium text-gray-700">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-purple-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-5 py-4 pr-14 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-purple-600 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* DEMO LOGIN BUTTON */}
        <button
          type="button"
          onClick={handleOpenGuestModal}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 py-3.5 text-sm font-bold text-purple-700 transition hover:bg-purple-100"
        >
          <Sparkles size={18} />
          Explore as Guest (Instant Preview)
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-gray-200"></div>
          <span className="text-xs font-bold text-gray-400">OR</span>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>

        {/* GOOGLE */}
        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full rounded-2xl border border-gray-200 bg-white py-4 font-semibold text-gray-700 transition-all hover:border-purple-300 hover:bg-gray-50"
        >
          Continue with Google
        </button>

        {/* SIGNUP */}
        <p className="text-center text-gray-500">
          Don’t have an account?{" "}
          <Link to="/signup" className="font-semibold text-purple-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>

      {/* GUEST NAME ENTRY MODAL */}
      {guestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Welcome to YouMatter</h3>
                  <p className="text-xs text-slate-500">Guest Visit Setup</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGuestModalOpen(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={confirmGuestLogin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  What name should we call you?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex or Guest User"
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                  autoFocus
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-slate-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 font-semibold"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setGuestModalOpen(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-purple-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-purple-700"
                >
                  Start Exploring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default Login;
