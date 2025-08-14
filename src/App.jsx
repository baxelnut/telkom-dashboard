import {
  Navigate,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
// Style
import "./App.css";
// Components
import AdminPanelPage from "./pages/admin-panel/AdminPanelPage";
import LoginPage from "./pages/auth/LoginPage";
import ManageUserPage from "./pages/admin-panel/ManageUserPage";
import PageNotFound from "./pages/PageNotFound";
import ScrollToTop from "./components/utils/ScrollToTop";
// Layouts
import Layout from "./components/layouts/Layout";
// Routes
import { appRoutes } from "./routes/AppRoutes";
import { ProtectedRoute, RedirectIfLoggedIn } from "./routes/ProtectedRoute";
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
                <Layout pageTitle="Admin Panel" API_URL={API_URL}>
                  <AdminPanelPage API_URL={API_URL} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel/:uid"
            element={
              <ProtectedRoute adminOnly>
                <ManageUserPage API_URL={API_URL} />
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
