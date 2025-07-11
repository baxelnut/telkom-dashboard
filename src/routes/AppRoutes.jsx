// Pages
import OverviewPage from "../pages/overview/OverviewPage";
// Routes
import { ProtectedRoute, RedirectIfLoggedIn } from "./ProtectedRoute";

export const appRoutes = [
  { path: "/", element: <OverviewPage /> },
  { path: "/overview", element: <OverviewPage /> },
];
