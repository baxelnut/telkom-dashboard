// Pages
import ActionBasedPage from "../pages/action-based/ActionBasedPage";
import AdminPanelPage from "../pages/admin-panel/AdminPanelPage";
import AosodomoroReportPage from "../pages/reports/aosodomoro/AosodomoroReportPage";
import GalaksiReportPage from "../pages/reports/galaksi/GalaksiReportPage";
import OverviewPage from "../pages/overview/OverviewPage";
// Routes
import { ProtectedRoute, RedirectIfLoggedIn } from "./ProtectedRoute";

export const appRoutes = [
  { path: "/", element: <OverviewPage />, title: "Overview" },
  { path: "/overview", element: <OverviewPage />, title: "Overview" },
  {
    path: "/reports/aosodomoro",
    element: <AosodomoroReportPage />,
    title: "Report AOSODOMORO",
  },
  {
    path: "/reports/galaksi",
    element: <GalaksiReportPage />,
    title: "Report GALAKSI",
  },
  {
    path: "/action-based",
    element: <ActionBasedPage />,
    title: "Action-Based",
  },
  { path: "/admin-panel", element: <AdminPanelPage />, title: "Admin Panel" },
];
