import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "../config/supabaseClient";

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshAuth: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      // Check real Supabase session first
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        localStorage.setItem("token", currentSession.access_token);
        const name =
          currentSession.user.user_metadata?.full_name ||
          currentSession.user.user_metadata?.name ||
          currentSession.user.email?.split("@")[0] ||
          "User";
        localStorage.setItem("userName", name);
        localStorage.setItem("youmatter_user_name", name);
      } else {
        // Clear any stale or legacy demo-guest-token from localStorage
        const token = localStorage.getItem("token");
        if (token && token.startsWith("demo-guest-token")) {
          if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_GUEST === "true") {
            const guestName = localStorage.getItem("youmatter_user_name") || localStorage.getItem("userName") || "Guest User";
            const guestObj = { id: "guest", user_metadata: { full_name: guestName } };
            setSession({ access_token: token, user: guestObj });
            setUser(guestObj);
          } else {
            // Remove legacy demo token so real Supabase authentication is enforced in production
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            localStorage.removeItem("youmatter_user_name");
            setSession(null);
            setUser(null);
          }
        } else {
          setSession(null);
          setUser(null);
        }
      }
    } catch (err) {
      console.warn("Auth initialization notice:", err);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        localStorage.setItem("token", newSession.access_token);
        const name =
          newSession.user.user_metadata?.full_name ||
          newSession.user.user_metadata?.name ||
          newSession.user.email?.split("@")[0] ||
          "User";
        localStorage.setItem("userName", name);
        localStorage.setItem("youmatter_user_name", name);

        if (window.location.hash.includes("access_token=") || window.location.search.includes("code=")) {
          window.history.replaceState(null, "", "/home");
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      } else {
        const token = localStorage.getItem("token");
        if (token && token.startsWith("demo-guest-token") && (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_GUEST !== "true")) {
          localStorage.removeItem("token");
          localStorage.removeItem("userName");
          localStorage.removeItem("youmatter_user_name");
        }
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("youmatter_user_name");
    setSession(null);
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out notice:", err);
    } finally {
      setLoading(false);
    }
  };

  // Production authentication requires a valid Supabase session
  const isAuthenticated = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_GUEST === "true"
    ? !!session
    : !!session && !!user && user.id !== "guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated,
        signOut,
        refreshAuth: initAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
