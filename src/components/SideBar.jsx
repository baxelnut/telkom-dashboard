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
      id: "selection1",
      label: "SelectionMenu 1",
      icon: "src/assets/icons/grid-fill.svg",
      path: "*",
    },
    {
      id: "selection2",
      label: "SelectionMenu 2",
      icon: "src/assets/icons/grid-fill.svg",
      path: "*",
    },
    {
      id: "selection3",
      label: "SelectionMenu 3",
      icon: "src/assets/icons/grid-fill.svg",
      path: "*",
    },
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/TLK_BIG.svg" alt="logo" />
      </div>
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
            <h5>{item.label}</h5>
          </div>
        ))}
      </div>
    </div>
  );
}
