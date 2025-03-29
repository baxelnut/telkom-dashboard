import { useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { SupabaseProvider } from "./services/SupabaseContext";
import Footer from "./components/footer/Footer";
import SideBar from "./components/sidebar/SideBar";
import PageNotFound from "./features/PageNotFound";
import OverviewPage from "./features/overview/OverviewPage";
import PerformancePage from "./features/performance/PerformancePage";
import ReportPage from "./features/report/ReportPage";
import ExamplePage from "./features/example/ExamplePage";
import Header from "./components/header/Header";

const pageConfig = {
  "/": { title: "Overview" },
  "/overview": { title: "Overview" },
  "/performance": { title: "Performance" },
  "/report": { title: "Report" },
  "/example": { title: "Example" },
};

function AppContent() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const isNotFound = !(pageConfig[pathname] || pathname === "/");

  const handleMobileMenuClick = () => {
    setIsSidebarOpen((prev) => !prev);
  };

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

  return (
    <div className="app-container">
      {isSidebarOpen && (
        <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <div
        ref={sidebarRef}
        className={`sidebar ${isSidebarOpen ? "active" : ""}`}
      >
        <SideBar />
      </div>

      <div className="content-container">
        <div className="header">
          {!isNotFound && (
            <Header
              title={pageConfig[location.pathname]?.title || "Dashboard"}
              user={{
                name: "Basilius Tengang",
                imageUrl:
                  "https://media.licdn.com/dms/image/v2/D5603AQEOUn3wMVGnGQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1701105430319?e=1746057600&v=beta&t=UpXVCVR_jttTVKh1Q-YsfJ-1_3kwWzKCTVmiKwdGi6A",
              }}
              onMenuClick={handleMobileMenuClick}
            />
          )}
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/example" element={<ExamplePage />} />
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
      <Router>
        <AppContent />
      </Router>
    </SupabaseProvider>
  );
}

export default App;
