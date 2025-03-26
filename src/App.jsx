import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Footer from "./components/footer/Footer";
import SideBar from "./components/sidebar/SideBar";
import PageNotFound from "./features/PageNotFound";
import OverviewPage from "./features/overview/OverviewPage";
import PerformancePage from "./features/performance/PerformancePage";
import ReportPage from "./features/report/ReportPage";
import ExamplePage from "./features/example/ExamplePage";
import Header from "./components/header/Header";

function AppContent() {
  const location = useLocation();
  const pathname = location.pathname;

  const pageConfig = {
    "/": { title: "Overview" },
    "/overview": { title: "Overview" },
    "/performance": { title: "Performance" },
    "/report": { title: "Report" },
    "/example": { title: "Example" },
  };

  const isNotFound = !(pageConfig[pathname] || pathname === "/");

  return (
    <div className="app-container">
      <div className="sidebar">
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
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
