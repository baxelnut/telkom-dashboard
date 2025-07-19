// Pages
import ActionBasedPage from "../pages/action-based/ActionBasedPage";
import AosodomoroReportPage from "../pages/reports/aosodomoro/AosodomoroReportPage";
import CompletionRatioPage from "../pages/kpis/completion-ratio/CompletionRatioPage";
import GalaksiReportPage from "../pages/reports/galaksi/GalaksiReportPage";
import OverallHealthIndexPage from "../pages/kpis/health-index/OverallHealthIndexPage";
import OverviewPage from "../pages/overview/OverviewPage";
import SLAPage from "../pages/kpis/sla/SLAPage";
// API URLs
const API_URL = import.meta.env.VITE_API_URL;
const DEV_API_URL = import.meta.env.VITE_DEV_API;

// ===== FOR TESTING =====
// import ExamplePage from "../pages/ExamplePage";

export const appRoutes = [
  // ===== FOR TESTING =====
  // {
  //   path: "/example",
  //   element: <ExamplePage API_URL={DEV_API_URL} />,
  //   title: "TESTING",
  // },
  {
    path: "/",
    element: <OverviewPage API_URL={API_URL} />,
    title: "Overview",
  },
  {
    path: "/overview",
    element: <OverviewPage API_URL={API_URL} />,
    title: "Overview",
  },

  {
    path: "/reports/aosodomoro",
    element: <AosodomoroReportPage API_URL={API_URL} />,
    title: "Report AOSODOMORO",
  },
  {
    path: "/reports/galaksi",
    element: <GalaksiReportPage API_URL={API_URL} />,
    title: "Report GALAKSI",
  },

  {
    path: "/kpis/completion-ratio",
    element: <CompletionRatioPage API_URL={API_URL} />,
    title: "Completion Ratio",
  },
  {
    path: "/kpis/sla",
    element: <SLAPage API_URL={API_URL} />,
    title: "SLA",
  },
  {
    path: "/kpis/health-index",
    element: <OverallHealthIndexPage API_URL={API_URL} />,
    title: "Overall Health Index",
  },

  {
    path: "/action-based",
    element: <ActionBasedPage API_URL={API_URL} />,
    title: "Action Based",
  },
];
