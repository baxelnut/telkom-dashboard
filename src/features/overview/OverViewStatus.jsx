import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import "./OverViewStatus.css";

const getStatusColorsFromCSS = () => {
  const styles = getComputedStyle(document.documentElement);
  return {
    lanjut: styles.getPropertyValue("--success"),
    cancel: styles.getPropertyValue("--error"),
    bukan_order_reg: styles.getPropertyValue("--secondary"),
    no_status: styles.getPropertyValue("--text-variant"),
  };
};

const STATUS_COLORS = getStatusColorsFromCSS();

const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length || !total) return null;

  const { name, value } = payload[0];

  const statusKey = Object.keys(STATUS_COLORS).find((key) => {
    const displayName = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return displayName === name;
  });

  const statusColor = STATUS_COLORS[statusKey] || "var(--text-variant)";
  const percent = ((value / total) * 100).toFixed(1);

  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{name}</p>
      <p>→</p>
      <h6
        className="tooltip-value"
        style={{ color: statusColor }}
      >{`${percent}%`}</h6>
    </div>
  );
};

export default function OverViewStatus({ overviewStatus, onClick }) {
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
    <div className="overview-pie" onClick={onClick}>
      <h5>{overviewStatus["new_witel"] || "Unknown"}</h5>

      <PieChart width={200} height={220}>
        <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value">
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={(props) => <CustomTooltip {...props} total={total} />}
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
              <p>
                {item.name} ({`${((item.value / total) * 100).toFixed(1)}%`})
              </p>
              <p>{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
