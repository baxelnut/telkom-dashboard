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
    label: "Action Based",
    path: "/action-based",
    leading: SVG_PATHS.handClick,
  },
  {
    label: "Admin Panel",
    path: "/admin-panel",
    leading: SVG_PATHS.adminPerson,
  },
];
