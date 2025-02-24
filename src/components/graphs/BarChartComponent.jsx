import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { readFile } from "../../service/data/readExcel";

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
          acc.push({ name: subSegmen, value: 1 });
        }
        return acc;
      }, []);

      setData(processedData);
    }

    fetchData();
  }, [filePath]);

  return (
    <div className="bar-chart">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#4CAF50" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
