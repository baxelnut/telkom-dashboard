import React, { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { readFile } from "../../service/data/readExcel";
import "./RadarChartComponent.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff0000"];

export default function RadarChartComponent({ filePath, columnName }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const fileData = await readFile(filePath);

      if (!fileData || fileData.length === 0) return;

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

      setData(processedData);
    }

    fetchData();
  }, [filePath, columnName]);

  return (
    <ResponsiveContainer width="100%" height={400} className="radar">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
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
  );
}
