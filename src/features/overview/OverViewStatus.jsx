import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import "./OverViewStatus.css";

const STATUS_COLORS = {
  lanjut: "#e76705",
  cancel: "#312a68",
  bukan_order_reg: "#14A44D",
  no_status: "grey",
};

export default function OverViewStatus({ overviewStatus }) {
  const statuses = Object.entries(STATUS_COLORS);

  const pieData = statuses
    .map(([key, color]) => ({
      key,
      name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: overviewStatus[key] || 0,
      color,
    }))
    .filter((item) => item.value > 0);

  const total = pieData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="overview-pie">
      <h5>{overviewStatus["bill_witel"] || "Unknown"}</h5>

      <PieChart width={200} height={220}>
        <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value">
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, props) => {
            const percent = ((value / total) * 100).toFixed(1);
            return [`${percent}%`, name];
          }}
        />
      </PieChart>

      <div className="o-pie-dec-container">
        {pieData.map((item, index) => {
          return (
            <div
              key={index}
              className="o-pie-dec"
              style={{ color: item.color }}
            >
              <p>{item.name}</p>
              <p>{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
