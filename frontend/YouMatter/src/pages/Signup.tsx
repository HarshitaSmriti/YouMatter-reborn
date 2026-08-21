import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import supabase from "../config/supabaseClient";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const checkActiveSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const username =
          data.session.user.user_metadata?.full_name ||
          data.session.user.user_metadata?.name ||
          data.session.user.email?.split("@")[0] ||
          "Friend";
        localStorage.setItem("userName", username);
        localStorage.setItem("youmatter_user_name", username);

        const hasConsent = localStorage.getItem("consentGiven") === "true";
        navigate(hasConsent ? "/home" : "/consent", { replace: true });
      }
    };
    checkActiveSession();
  }, [navigate]);

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setErrorMsg("Please accept the Terms & Conditions.");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      localStorage.setItem("userName", fullName);
      localStorage.setItem("userEmail", email);
      if (data.session) {
        localStorage.setItem("token", data.session.access_token);
      }

      navigate("/consent");
    } catch (err: any) {
      console.error("Signup error:", err);
      setErrorMsg("Registration failed. Please check your network and Supabase configuration.");
    } finally {
      setLoading(false);
    }
  };

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
      title="Create account"
      subtitle="Start your mental wellness journey today."
    >
      <form className="space-y-6" onSubmit={handleSignup}>
        {/* ERROR BANNER */}
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle size={20} className="shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* NAME */}
        <div>
          <label className="mb-2 block font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            required
          />
        </div>

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
          <label className="mb-2 block font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create password"
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

        {/* CONFIRM PASSWORD */}
        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-5 py-4 pr-14 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* TERMS */}
        <label className="flex items-start gap-3 text-sm leading-relaxed text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 accent-purple-600 rounded"
          />
          I agree to the Terms & Conditions and Privacy Policy.
        </label>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-purple-600 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
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

        {/* LOGIN */}
        <p className="text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-purple-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Signup;