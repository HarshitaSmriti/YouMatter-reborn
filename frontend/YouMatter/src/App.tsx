import {
  Routes,
  Route,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";
import MoodTracker from "./pages/MoodTracker";
import Breathing from "./pages/Breathing";
import Games from "./pages/Games";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import ConsentForm from "./pages/ConsentForm";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

import {
  useEffect,
  useState,
} from "react";

function App() {
  const [darkMode, setDarkMode] =
    useState(false);

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add(
        "dark"
      );

      localStorage.setItem(
        "theme",
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );

      localStorage.setItem(
        "theme",
        "light"
      );
    }
  }, [darkMode]);

  return (
    <Routes>
      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/consent"
        element={<ConsentForm />}
      />

      <Route
        path="/home"
        element={<Home />}
      />

      <Route
        path="/chat"
        element={<Chat />}
      />

      <Route
        path="/journal"
        element={<Journal />}
      />

      <Route
        path="/mood"
        element={<MoodTracker />}
      />

      <Route
        path="/breathing"
        element={<Breathing />}
      />

      <Route
        path="/games"
        element={<Games />}
      />

      <Route
        path="/support"
        element={<Support />}
      />

      <Route
        path="/settings"
        element={<Settings />}
      />

      <Route
        path="/auth/callback"
        element={<AuthCallback />}
      />

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default App;
