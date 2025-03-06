import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import "./OverViewCard.css";

const categoryColors = {
  "Provide Order": "#d72323",
  "In Process": "#e76705",
  "Prov. Complete": "#5cb338",
  "Ready to Bill": "#312a68",
  Unknown: "#999999",
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
    >
      {value}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, payload: item } = payload[0];
    return (
      <div className="custom-tooltip">
        <p>{name}</p>
        <h6>{`: ${item.percentage}%`}</h6>
      </div>
    );
  }
  return null;
};

export default function OverViewCard({ data, title }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const pieDataWithPercentage = data
    .filter((item) => item.value > 0 && item.name !== "Billing Completed") // exclude: Billing Completed
    .map((item) => ({
      ...item,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(2) : "0.00",
    })); // random percentage for now

  const randomChange =
    Math.floor(Math.random() * 10) * (Math.random() < 0.5 ? -1 : 1);
  const previousTotal = total + randomChange;

  const percentageChange = previousTotal
    ? (((total - previousTotal) / previousTotal) * 100).toFixed(2)
    : "0.00";

  const isPositive = percentageChange >= 0;
  const percentageClass = isPositive ? "positive" : "negative";
  const symbol = percentageChange === "0.00" ? "" : isPositive ? "+" : "";
  const percentageSubtitle = "Compared to yesterday"; // compared to yesterday for now

  return (
    <div className="overview-card">
      <h4>{title}</h4>
      <div className="pie-chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              dataKey="value"
              data={pieDataWithPercentage}
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {pieDataWithPercentage.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={categoryColors[entry.name] || categoryColors.Unknown}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="comparison">
        <div className={`percentage ${percentageClass}`}>
          <h6>{`${symbol}${percentageChange}%`}</h6>
        </div>
        <p>{percentageSubtitle}</p>
      </div>
    </div>
  );
}
