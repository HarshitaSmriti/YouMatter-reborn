import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "../config/supabaseClient";

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  isGuestOrAuth: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isGuest: false,
  isGuestOrAuth: false,
  signOut: async () => {},
  refreshAuth: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const initAuth = async () => {
    try {
      // Check real Supabase session first
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setIsGuest(false);
        localStorage.setItem("token", currentSession.access_token);
        const name =
          currentSession.user.user_metadata?.full_name ||
          currentSession.user.user_metadata?.name ||
          currentSession.user.email?.split("@")[0] ||
          "User";
        localStorage.setItem("userName", name);
        localStorage.setItem("youmatter_user_name", name);
      } else {
        // Check if Guest token exists
        const token = localStorage.getItem("token");
        if (token && token.startsWith("demo-guest-token")) {
          const guestName = localStorage.getItem("youmatter_user_name") || localStorage.getItem("userName") || "Guest User";
          const guestObj = { id: "guest", user_metadata: { full_name: guestName } };
          setSession({ access_token: token, user: guestObj });
          setUser(guestObj);
          setIsGuest(true);
        } else {
          setSession(null);
          setUser(null);
          setIsGuest(false);
        }
      }
    } catch (err) {
      console.warn("Auth initialization notice:", err);
      setSession(null);
      setUser(null);
      setIsGuest(false);
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
        setIsGuest(false);
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
        if (!token || !token.startsWith("demo-guest-token")) {
          setSession(null);
          setUser(null);
          setIsGuest(false);
        }
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
    setIsGuest(false);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out notice:", err);
    } finally {
      setLoading(false);
    }
  };

  // Registered Supabase user session
  const isAuthenticated = !!session && !!user && user.id !== "guest";
  
  // Guest session or registered user session
  const isGuestOrAuth = isAuthenticated || isGuest;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated,
        isGuest,
        isGuestOrAuth,
        signOut,
        refreshAuth: initAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
