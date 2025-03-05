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
        const response = await fetch("http://localhost:5000/api/data");
        const jsonData = await response.json();

        const processedData = jsonData.reduce((acc, row) => {
          const category = row[columnName] || "Unknown";
          const existing = acc.find((item) => item.name === category);
          if (existing) {
            existing.value += 1;
          } else {
            acc.push({
              name: category,
              shortName: getInitials(category),
              value: 1,
            });
          }
          return acc;
        }, []);

        const sortedData = processedData
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  return (
    <div className="bar-chart">
      {loading ? (
        <Loading />
      ) : (
        <ResponsiveContainer width="90%" height={250}>
          <BarChart data={data}>
            <XAxis
              className="bar-label"
              dataKey="shortName"
              tickFormatter={(value, index) => data[index]?.shortName}
            />
            <Tooltip
              formatter={(value, name, props) => [value, props.payload.name]}
            />
            <Bar dataKey="value" className="bar" fill="var(--color-primary)">
              <LabelList dataKey="value" position="on" className="bar-label" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
