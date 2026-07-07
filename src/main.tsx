import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import App from "./App.tsx";
import { startAmbient, handleVisibilityChange } from "./lib/ambientSound";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

startAmbient();
document.addEventListener("visibilitychange", handleVisibilityChange);
