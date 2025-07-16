// Pages
import ActionBasedPage from "../pages/action-based/ActionBasedPage";
import AosodomoroReportPage from "../pages/reports/aosodomoro/AosodomoroReportPage";
import GalaksiReportPage from "../pages/reports/galaksi/GalaksiReportPage";
import OverviewPage from "../pages/overview/OverviewPage";
// Example Page
import ExamplePage from "../pages/ExamplePage";  // ===== FOR TESTING ONLY =====
// API URLs
const API_URL = import.meta.env.VITE_API_URL;
const DEV_API_URL = import.meta.env.VITE_DEV_API;

export const appRoutes = [
  // ===== FOR TESTING ONLY =====
  {
    path: "/example",
    element: <ExamplePage API_URL={DEV_API_URL} />,
    title: "TESTING",
  },
  // ===== FOR TESTING ONLY =====
  {
    path: "/",
    element: <OverviewPage API_URL={DEV_API_URL} />,
    title: "Overview",
  },
  {
    path: "/overview",
    element: <OverviewPage API_URL={DEV_API_URL} />,
    title: "Overview",
  },
  {
    path: "/reports/aosodomoro",
    element: <AosodomoroReportPage API_URL={DEV_API_URL} />,
    title: "Report AOSODOMORO",
  },
  {
    path: "/reports/galaksi",
    element: <GalaksiReportPage API_URL={DEV_API_URL} />,
    title: "Report GALAKSI",
  },
  {
    path: "/action-based",
    element: <ActionBasedPage API_URL={DEV_API_URL} />,
    title: "Action-Based",
  },
];
