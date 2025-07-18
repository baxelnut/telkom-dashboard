import { SVG_PATHS } from "./utilData";

export const SIDEBAR_MENUS = [
  {
    label: "Overview",
    path: "/overview",
    leading: SVG_PATHS.gridFill,
  },
  {
    label: "Reports",
    leading: SVG_PATHS.graphUp,
    children: [
      {
        label: "AOSODOMORO",
        path: "/reports/aosodomoro",
      },
      {
        label: "GALAKSI",
        path: "/reports/galaksi",
      },
    ],
  },
  {
    label: "KPIs",
    leading: SVG_PATHS.speedometer,
    children: [
      {
        label: "Completion Ratio",
        path: "/kpis/completion-ratio",
      },
      {
        label: "SLA",
        path: "/kpis/sla",
      },
      {
        label: "Health Index",
        path: "/kpis/health-index",
      },
    ],
  },
  {
    label: "Action Based",
    path: "/action-based",
    leading: SVG_PATHS.handClick,
  },
  {
    label: "Admin Panel",
    path: "/admin-panel",
    leading: SVG_PATHS.admin,
  },
];
