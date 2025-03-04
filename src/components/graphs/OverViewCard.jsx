import React, { useState, useEffect } from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { readFile } from "../../service/data/readExcel";
import Loading from "../Loading";
import "./OverViewCard.css";

const categoryColors = {
  "PROVIDE ORDER": "#d72323",
  "IN PROCESS": "#e76705",
  "PROV. COMPLETE": "#5cb338",
  "READY TO BILL": "#312a68",
  Unknown: "#999999",
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
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
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function OverViewCard({
  percentage,
  percentageSubtitle,
  filePath,
  witelName,
}) {
  const isPositive = percentage > 0;
  const percentageClass = isPositive ? "positive" : "negative";
  const symbol = percentage === 0 ? "+" : isPositive ? "+" : "";

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const fileData = await readFile(filePath);
      if (!fileData || fileData.length === 0) {
        console.warn("No Data Found");
        setLoading(false);
        return;
      }

      const statusCounts = fileData
        .filter((row) => row["BILL_WITEL"] === witelName)
        .reduce((acc, row) => {
          const status = row["KATEGORI"] || "Unknown";
          if (status === "BILLING COMPLETED") {
            return acc;
          }
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

      const processedData = Object.entries(statusCounts).map(
        ([name, value]) => ({
          name,
          value,
          fill: categoryColors[name] || categoryColors.Unknown,
        })
      );

      console.log(`Status Data for ${witelName}:`, processedData);
      setData(processedData);
      setLoading(false);
    }

    fetchData();
  }, [filePath, witelName]);

  return (
    <div className="overview-card">
      <h4>{witelName}</h4>
      <div className="pie-chart-container">
        {loading ? (
          <Loading />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                dataKey="value"
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="comparison">
        <div className={`percentage ${percentageClass}`}>
          <h6>{`${symbol}${percentage}%`}</h6>
        </div>
        <p>{percentageSubtitle}</p>
      </div>
    </div>
  );
}
