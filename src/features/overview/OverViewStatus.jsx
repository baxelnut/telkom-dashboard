import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import "./OverViewStatus.css";
import Loading from "../../components/utils/Loading";

export default function OverViewStatus({ overviewStatus, loading, error }) {
  if (!overviewStatus) return <Loading />;

  const completed = overviewStatus["complete"] || 0;

  const pieData = [
    {
      name: "Pending BASO",
      value: overviewStatus["pending_baso"] || 0,
      color: "#e76705",
    },
    {
      name: "In Progress",
      value: overviewStatus["in_progress"] || 0,
      color: "#312a68",
    },
    {
      name: "Pending",
      value: overviewStatus["pending"] || 0,
      color: "#14A44D",
    },
    {
      name: "Pending Bill Apv",
      value: overviewStatus["pending_bill_apv"] || 0,
      color: "#2D82B7",
    },
    {
      name: "Sending",
      value: overviewStatus["sending"] || 0,
      color: "#892CDC",
    },
    {
      name: "Submitted",
      value: overviewStatus["submitted"] || 0,
      color: "#FF4D6D",
    },
  ];

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

      {pieData
        .filter((item) => item.value > 0)
        .map((item, index) => (
          <div key={index} className="o-pie-dec" style={{ color: item.color }}>
            <p>{item.name}</p>
            <p>{item.value}</p>
          </div>
        ))}

      <h6>{completedPercentage}% Completed</h6>
      <p>({completed})</p>

      {/* <pre>{JSON.stringify(overviewStatus, null, 2)}</pre> */}
    </div>
  );
}
