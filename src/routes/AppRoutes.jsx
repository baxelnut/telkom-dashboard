// Pages
import ActionBasedPage from "../pages/action-based/ActionBasedPage";
import AdminPanelPage from "../pages/admin-panel/AdminPanelPage";
import AosodomoroReportPage from "../pages/reports/aosodomoro/AosodomoroReportPage";
import GalaksiReportPage from "../pages/reports/galaksi/GalaksiReportPage";
import OverviewPage from "../pages/overview/OverviewPage";
// Routes
import { ProtectedRoute, RedirectIfLoggedIn } from "./ProtectedRoute";

export const appRoutes = [
  { path: "/", element: <OverviewPage /> },
  { path: "/overview", element: <OverviewPage /> },
  { path: "/reports/aosodomoro", element: <AosodomoroReportPage /> },
  { path: "/reports/galaksi", element: <GalaksiReportPage /> },
  { path: "/action-based", element: <ActionBasedPage /> },
  { path: "/admin-panel", element: <AdminPanelPage /> },
];
