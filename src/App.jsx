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
// Layouts
import Layout from "./components/layouts/Layout";
// Context
import { useTheme } from "./context/ThemeContext";
// Routes
import { appRoutes } from "./routes/AppRoutes";
import LoginPage from "./pages/auth/LoginPage";

export default function App() {
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
