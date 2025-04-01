import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import "./OverViewStatus.css";
import Loading from "../../components/utils/Loading";

const STATUS_COLORS = {
  pending_baso: "#e76705",
  in_progress: "#312a68",
  pending: "#14A44D",
  pending_bill_apv: "#2D82B7",
  sending: "#892CDC",
  submitted: "#FF4D6D",
};

export default function OverViewStatus({ overviewStatus, loading, error }) {
  if (loading || !overviewStatus) return <Loading />;

  const completed = overviewStatus["complete"] || 0;
  const statuses = Object.entries(STATUS_COLORS);

  const pieData = statuses
    .map(([key, color]) => ({
      name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: overviewStatus[key] || 0,
      color,
    }))
    .filter((item) => item.value > 0);

  const totalOtherStatuses = pieData.reduce((sum, item) => sum + item.value, 0);
  const totalAll = totalOtherStatuses + completed;
  const completedPercentage =
    totalAll > 0 ? ((completed / totalAll) * 100).toFixed(2) : 0;

  return (
    <div className="overview-pie">
      <h5>{overviewStatus["witel_name"] || "Unknown"}</h5>

      <PieChart width={200} height={220}>
        <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value">
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      {pieData.map((item, index) => (
        <div key={index} className="o-pie-dec" style={{ color: item.color }}>
          <p>{item.name}</p>
          <p>{item.value}</p>
        </div>
      ))}

      <h6 style={{ marginTop: "10px" }}>{completedPercentage}% Completed</h6>
      <p>({completed})</p>
    </div>
  );
}
