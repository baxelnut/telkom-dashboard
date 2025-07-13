// Pages
import ActionBasedPage from "../pages/action-based/ActionBasedPage";
import AdminPanelPage from "../pages/admin-panel/AdminPanelPage";
import AosodomoroReportPage from "../pages/reports/aosodomoro/AosodomoroReportPage";
import GalaksiReportPage from "../pages/reports/galaksi/GalaksiReportPage";
import OverviewPage from "../pages/overview/OverviewPage";
// Routes
import { ProtectedRoute, RedirectIfLoggedIn } from "./ProtectedRoute";
// API URLs
const API_URL = import.meta.env.VITE_API_URL;
const DEV_API_URL = import.meta.env.VITE_DEV_API;

export const appRoutes = [
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
  {
    path: "/admin-panel",
    element: <AdminPanelPage API_URL={DEV_API_URL} />,
    title: "Admin Panel",
  },
];
