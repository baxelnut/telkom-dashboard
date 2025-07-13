import { useEffect, useState } from "react";
import {
  Navigate,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
// Style
import "./App.css";
// Components
import Error from "./components/ui/states/Error";
import Loading from "./components/ui/states/Loading";
import ScrollToTop from "./components/utils/ScrollToTop";
import PageNotFound from "./pages/PageNotFound";
// Layouts
import Layout from "./components/layouts/Layout";
// Context
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
// Routes
import { appRoutes } from "./routes/AppRoutes";
import LoginPage from "./pages/auth/LoginPage";

const API_URL = import.meta.env.VITE_API_URL;
const DEV_API_URL = import.meta.env.VITE_DEV_API;

export default function App() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <div className={`app-container ${isDarkMode ? "dark" : "light"}`}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/overview" replace />} />
          {appRoutes.map(({ path, element, title }) => (
            <Route
              key={path}
              path={path}
              element={<Layout pageTitle={title}>{element}</Layout>}
            />
          ))}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </div>
  );
}
