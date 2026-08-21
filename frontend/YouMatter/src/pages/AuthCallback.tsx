import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("Authentication callback failed:", error?.message);
        navigate("/login", { replace: true });
        return;
      }

      const session = data.session;
      const user = session.user;

      localStorage.setItem("token", session.access_token);

      const username =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Friend";

      localStorage.setItem("userName", username);
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("youmatter_user_name", username);

      const hasConsent = localStorage.getItem("consentGiven") === "true";
      navigate(hasConsent ? "/home" : "/consent", { replace: true });
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfbff] text-[#241b43]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#8a6dff] border-t-transparent"></div>
      <p className="mt-4 font-bold text-lg">Completing Google Sign-In...</p>
    </div>
  );
}

export default AuthCallback;