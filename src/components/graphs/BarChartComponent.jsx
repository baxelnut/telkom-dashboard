import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { readFile } from "../../service/data/readExcel";
import "./BarChartComponent.css";

export default function BarChartComponent({ filePath }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const fileData = await readFile(filePath);
      const processedData = fileData.reduce((acc, row) => {
        const subSegmen = row.SUB_SEGMEN || "Unknown";
        const existing = acc.find((item) => item.name === subSegmen);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({
            name: subSegmen,
            shortName: getInitials(subSegmen),
            value: 1,
          });
        }
        return acc;
      }, []);

      setData(processedData);
    }

    fetchData();
  }, [filePath]);

  function getInitials(name) {
    return name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("");
  }

  return (
    <div className="bar-chart">
      <ResponsiveContainer>
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
    </div>
  );
}
