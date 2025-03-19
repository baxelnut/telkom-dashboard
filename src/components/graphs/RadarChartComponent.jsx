import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import "./RadarChartComponent.css";
import Loading from "../Loading";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff0000"];

export default function RadarChartComponent({ fileData, columnName }) {
  const categoryCounts = fileData.reduce((acc, row) => {
    const category = row[columnName] || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const processedData = Object.keys(categoryCounts).map((key, index) => ({
    subject: key,
    value: categoryCounts[key],
    fullMark: Math.max(...Object.values(categoryCounts)),
    fill: COLORS[index % COLORS.length],
  }));

  if (!fileData || fileData.length === 0)
    return (
      <div className="radar-container">
        <Loading />
      </div>
    );

  return (
    <div className="radar-container">
      <ResponsiveContainer width="90%" height={250} className="radar">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={processedData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          <Radar
            name="Data Distribution"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
