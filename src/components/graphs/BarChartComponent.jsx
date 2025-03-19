import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import "./BarChartComponent.css";
import Loading from "../Loading";

export default function BarChartComponent({ columnName }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/all-data");
        if (!response.ok) throw new Error("API request failed");

        const jsonData = await response.json();
        console.log("Fetched data:", jsonData);

        if (!jsonData || jsonData.length === 0) {
          console.warn("No data received from API");
          setData([]);
          return;
        }

        const colorMap = {};
        const processedData = jsonData.reduce((acc, row) => {
          if (!row.hasOwnProperty(columnName)) {
            console.warn(`Column "${columnName}" not found in row:`, row);
            return acc;
          }

          const category = row[columnName] || "Unknown";
          if (!colorMap[category]) colorMap[category] = getRandomColor();

          const existing = acc.find((item) => item.name === category);
          if (existing) {
            existing.value += 1;
          } else {
            acc.push({
              name: category,
              shortName: getInitials(category),
              value: 1,
              fill: colorMap[category],
            });
          }
          return acc;
        }, []);

        if (processedData.length === 0) {
          console.warn("Processed data is empty");
          setData([]);
          return;
        }

        const sortedData = processedData
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        console.log("Final chart data:", sortedData);
        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setData([]);
      }
      setLoading(false);
    }

    fetchData();
  }, [columnName]);

  function getInitials(name) {
    return name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("");
  }

  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;

  useEffect(() => {
    console.log("Updated chart data:", data);
  }, [data]);

  return (
    <div className="bar-chart">
      {loading ? (
        <Loading />
      ) : data.length === 0 ? (
        <p className="error-message">No data available</p>
      ) : (
        <ResponsiveContainer width="90%" height={250}>
          <BarChart data={data}>
            <XAxis
              className="bar-label"
              dataKey="shortName"
              tickFormatter={(value) => value}
            />
            <Tooltip
              formatter={(value, name, props) => [value, props.payload.name]}
            />
            <Bar dataKey="value" fill="var(--color-primary)">
              <LabelList dataKey="value" position="top" className="bar-label" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
