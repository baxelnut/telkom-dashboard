import { useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { SupabaseProvider } from "./services/supabase/SupabaseContext";
import { AuthProvider, useAuth } from "./services/firebase/AuthContext";
import ProtectedRoute from "./services/firebase/ProtectedRoute";
import Footer from "./components/footer/Footer";
import SideBar from "./components/sidebar/SideBar";
import PageNotFound from "./features/PageNotFound";
import OverviewPage from "./features/overview/OverviewPage";
// import PerformancePage from "./features/performance/PerformancePage";
import ReportPage from "./features/report/ReportPage";
// import ExamplePage from "./features/example/ExamplePage";
import Header from "./components/header/Header";
import LoginPage from "./features/LoginPage";
import ActionPage from "./features/action/ActionPage";

const API_URL = import.meta.env.VITE_API_URL;
const DEV_API_URL = import.meta.env.VITE_DEV_API;

const pageConfig = {
  "/": { title: "Overview" },
  "/overview": { title: "Overview" },
  // "/performance": { title: "Performance" },
  "/report": { title: "Report" },
  // "/example": { title: "Example" },
  "/action": { title: "Action" },
};

function AppContent() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const theme = localStorage.getItem("theme");
    return theme === "dark";
  });

  const sidebarRef = useRef(null);
  const { user } = useAuth();

  const isNotFound = !(
    pageConfig[pathname] ||
    (pathname === "/" && pathname === "/login")
  );

  const handleMobileMenuClick = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.body.classList.toggle("light-mode", !isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (showDropdown) {
      setIsSidebarOpen(false);
    }
  }, [showDropdown]);

  return (
    <div className="app-container">
      {isSidebarOpen && (
        <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      {!isNotFound && !showDropdown && (
        <div
          ref={sidebarRef}
          className={`sidebar ${isSidebarOpen ? "active" : ""}`}
        >
          <SideBar isDarkMode={isDarkMode} />
        </div>
      )}

      <div className="content-container">
        <div className="header">
          {!isNotFound && (
            <Header
              title={pageConfig[location.pathname]?.title || "Dashboard"}
              user={{
                name: user?.displayName,
                email: user?.email,
                imageUrl: user?.photoURL,
              }}
              onMenuClick={handleMobileMenuClick}
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          )}
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route
              path="/overview"
              element={
                <ProtectedRoute>
                  <OverviewPage API_URL={API_URL} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <ReportPage API_URL={API_URL} userEmail={user?.email} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/action"
              element={
                <ProtectedRoute>
                  <ActionPage API_URL={DEV_API_URL} userEmail={user?.email} />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/performance"
              element={
                <ProtectedRoute>
                  <PerformancePage API_URL={API_URL} />
                </ProtectedRoute>
              }
            /> */}
            {/* <Route
              path="/example"
              element={
                <ProtectedRoute>
                  <ExamplePage API_URL={DEV_API_URL} />
                </ProtectedRoute>
              }
            /> */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>

          <div className="footer">{!isNotFound && <Footer />}</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default App;
