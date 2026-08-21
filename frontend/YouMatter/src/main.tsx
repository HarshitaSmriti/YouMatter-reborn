import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/global.css";

import App from "./App";
import { MoodProvider } from "./context/MoodContext";

const routerBasename =
  import.meta.env.BASE_URL === "/"
    ? "/"
    : import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <MoodProvider>
        <App />
      </MoodProvider>
    </BrowserRouter>
  </StrictMode>
);
