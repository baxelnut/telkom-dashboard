import {
  Navigate,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
// Style
import "./App.css";
// Components
import ScrollToTop from "./components/utils/ScrollToTop";
import PageNotFound from "./pages/PageNotFound";
import LoginPage from "./pages/auth/LoginPage";
// Layouts
import Layout from "./components/layouts/Layout";
// Context
import { useTheme } from "./context/ThemeContext";
// Routes
import { appRoutes } from "./routes/AppRoutes";
import { ProtectedRoute, RedirectIfLoggedIn } from "./routes/ProtectedRoute";

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
                  <Layout pageTitle={title}>{element}</Layout>
                </ProtectedRoute>
              }
            />
          ))}
          {/* 404 */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </div>
  );
}
