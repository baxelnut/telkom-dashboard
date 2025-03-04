import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SideBar.css";

export default function SideBar() {
  const [selected, setSelected] = useState("overview");
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: "src/assets/icons/grid-fill.svg",
      path: "/overview",
    },
    {
      id: "performance",
      label: "Performance",
      icon: "src/assets/icons/bar-chart-fill.svg",
      path: "/performance",
    },
    {
      id: "report",
      label: "Report",
      icon: "src/assets/icons/clipboard-data-fill.svg",
      path: "/report",
    },
    {
      id: "example",
      label: "Example",
      icon: "src/assets/icons/tornado.svg",
      path: "/example",
    },
    {
      id: "selection3",
      label: "selectionMenu3",
      icon: "src/assets/icons/grid-fill.svg",
      path: "*",
    },
  ];

  return (
    <div className="sidebar">
      <img className="logo" src="/TLK_BIG.svg" alt="logo" />
      <div className="menu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`menu-selection ${
              selected === item.id ? "selected" : ""
            }`}
            onClick={() => {
              setSelected(item.id);
              navigate(item.path);
            }}
          >
            <img className="icon" src={item.icon} alt={item.label} />
            <h6>{item.label}</h6>
          </div>
        ))}
      </div>
    </div>
  );
}
