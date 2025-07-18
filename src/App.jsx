import {
  Navigate,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
// Style
import "./App.css";
// Layouts
import Layout from "./components/layouts/Layout";
// Routes
import { appRoutes } from "./routes/AppRoutes";
import { ProtectedRoute, RedirectIfLoggedIn } from "./routes/ProtectedRoute";
// Components
import AdminPanelPage from "./pages/admin-panel/AdminPanelPage";
import ScrollToTop from "./components/utils/ScrollToTop";
import PageNotFound from "./pages/PageNotFound";
import LoginPage from "./pages/auth/LoginPage";
// Context
import { useTheme } from "./context/ThemeContext";
// API URLs
const API_URL = import.meta.env.VITE_API_URL;
const DEV_API_URL = import.meta.env.VITE_DEV_API;

export default function App() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`app-container ${isDarkMode ? "dark" : "light"}`}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public route - redirect if already logged in */}
          <Route
            path="/login"
            element={
              <RedirectIfLoggedIn>
                <LoginPage />
              </RedirectIfLoggedIn>
            }
          />
          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Protected routes */}
          {appRoutes.map(({ path, element, title }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
                  <Layout pageTitle={title} API_URL={API_URL}>
                    {element}
                  </Layout>
                </ProtectedRoute>
              }
            />
          ))}
          {/* Only admin */}
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute adminOnly>
                <Layout pageTitle="Admin Panel">
                  <AdminPanelPage API_URL={API_URL} />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* 404 */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </div>
  );
}
