import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { useAuth } from "../context/AuthContext";

function AuthCallback() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [statusText] = useState("Completing Google Sign-In...");

  useEffect(() => {
    let isMounted = true;
    let isHandled = false;

    const processSession = async (session: any) => {
      if (!session || !isMounted || isHandled) return;
      isHandled = true;

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

      await refreshAuth();
      const hasConsent = localStorage.getItem("consentGiven") === "true";
      navigate(hasConsent ? "/home" : "/consent", { replace: true });
    };

    // 1. Listen for Supabase Auth state changes (SIGNED_IN, INITIAL_SESSION)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await processSession(session);
      }
    });

    // 2. Poll getSession() with retry to allow Supabase client time to parse URL tokens/PKCE code
    let attempts = 0;
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (data?.session) {
          await processSession(data.session);
          return;
        }

        if (error) {
          console.warn("OAuth session lookup notice:", error.message);
        }

        if (attempts < 5 && !isHandled) {
          attempts++;
          setTimeout(checkSession, 300);
        } else if (!isHandled) {
          console.warn("Timeout waiting for OAuth session, redirecting to /login");
          if (isMounted) {
            navigate("/login", { replace: true });
          }
        }
      } catch (err) {
        console.error("Callback handling exception:", err);
        if (isMounted && !isHandled) {
          navigate("/login", { replace: true });
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, refreshAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfbff] text-[#241b43]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#8a6dff] border-t-transparent"></div>
      <p className="mt-4 font-bold text-lg">{statusText}</p>
    </div>
  );
}

export default AuthCallback;