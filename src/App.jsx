import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SideBar from "./components/SideBar";
import PageNotFound from "./features/PageNotFound";
import OverviewPage from "./features/overview/OverviewPage";
import PerformancePage from "./features/performance/PerformancePage";
import ReportPage from "./features/report/ReportPage";

function AppContent() {
  const location = useLocation();
  const isNotFound =
    location.pathname !== "/" &&
    location.pathname !== "/overview" &&
    location.pathname !== "/performance" &&
    location.pathname !== "/report";

  const pageConfig = {
    "/overview": { title: "Overview", showFilter: true, customActions: null },
    "/performance": {
      title: "Performance",
      showFilter: false,
      customActions: null,
    },
    "/report": {
      title: "Report",
      showFilter: false,
      customActions: null,
    },
  };

  const currentConfig = pageConfig[location.pathname];

  return (
    <div className="app-container">
      {!isNotFound && <SideBar />}
      <div className="content">
        <Routes>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/" element={<OverviewPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
      {!isNotFound && <Header {...currentConfig} />}
      {!isNotFound && <Footer />}
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
