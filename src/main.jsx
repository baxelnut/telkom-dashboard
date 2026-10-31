import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext";

import MaintenancePage from "./pages/MaintenancePage.jsx";
import PermanentRedirectPage from "./pages/PermanentRedirectPage.jsx";

// Toggle: set VITE_MAINTENANCE_MODE=true in .env (then rebuild/redeploy),
// or flip the fallback below to true.
const MAINTENANCE_MODE =
  (import.meta.env.VITE_MAINTENANCE_MODE ?? "false") === "true";

// Permanently redirect to new URL
const PERMANENT_REDIRECT =
  (import.meta.env.VITE_PERMANENT_REDIRECT ?? "true") === "true";

const root = ReactDOM.createRoot(document.getElementById("root"));

if (PERMANENT_REDIRECT) {
  root.render(
    <React.StrictMode>
      <PermanentRedirectPage />
    </React.StrictMode>,
  );
} else if (MAINTENANCE_MODE) {
  root.render(
    <React.StrictMode>
      <MaintenancePage />
    </React.StrictMode>,
  );
} else {
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </HelmetProvider>
    </React.StrictMode>,
  );
}
