import React, { useState, useMemo } from "react";
import "./PieChartComponent.css";
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";
import Loading from "../Loading";

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="var(--color-on-surface)"
      >
        {`Qty: ${value}`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="var(--color-on-surface-variant)"
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        className="chart-category"
      >
        {payload.name}
      </text>
    </g>
  );
};

export default function PieChartComponent({ fileData, columnName }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const processedData = useMemo(() => {
    const colorMap = {};

    return fileData.reduce((acc, row) => {
      const category = row[columnName] || "Unknown";

      if (!colorMap[category]) {
        colorMap[category] = getRandomColor();
      }

      const existing = acc.find((item) => item.name === category);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: category, value: 1, fill: colorMap[category] });
      }
      return acc;
    }, []);
  }, [fileData, columnName]);

  if (!fileData || fileData.length === 0)
    return (
      <div className="radar-container">
        <Loading />
      </div>
    );

  return (
    <div className="pie-chart-container">
      <ResponsiveContainer width="100%" height={400} className="pie">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={130}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
