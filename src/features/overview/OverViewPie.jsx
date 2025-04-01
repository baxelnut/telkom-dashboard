import React, { useState, useEffect, useMemo } from "react";
import "./OverViewPie.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";
import Dropdown from "../../components/utils/Dropdown";
import { PieChart, Pie, Sector, ResponsiveContainer, Legend } from "recharts";

const colorSet = ["#5cb338", "#e76705", "#2DAA9E", "#D91656", "#640D5F"];

export default function OverViewPie({ title, subtitle, API_URL }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWitel, setSelectedWitel] = useState("ALL");
  const [activeIndex, setActiveIndex] = useState(0);
  const [excludedCategories, setExcludedCategories] = useState([
    "Billing Completed",
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/aosodomoro/reg_3_kategori`);
        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        setError(error.message || "Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const witelOptions = useMemo(
    () => [
      { value: "ALL", label: "ALL" },
      ...[...new Set(data.map((item) => item.bill_witel))].map((witel) => ({
        value: witel,
        label: witel,
      })),
    ],
    [data]
  );

  const filteredData = useMemo(
    () =>
      selectedWitel === "ALL"
        ? data.reduce((acc, item) => {
            Object.keys(item).forEach((key) => {
              if (key !== "bill_witel") {
                acc[key] = (acc[key] || 0) + item[key];
              }
            });
            return acc;
          }, {})
        : data.find((item) => item.bill_witel === selectedWitel) || {},
    [selectedWitel, data]
  );

  const pieData = useMemo(
    () =>
      Object.keys(filteredData)
        .filter(
          (key) =>
            key !== "bill_witel" &&
            !excludedCategories.includes(
              key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            )
        )
        .map((key, index) => ({
          name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          value: filteredData[key],
          fill: colorSet[index % colorSet.length],
        })),
    [filteredData, excludedCategories]
  );

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
        <text
          x={cx}
          y={cy}
          dy={8}
          textAnchor="middle"
          fill={fill}
          fontSize={12}
        >
          {payload.name}
        </text>
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
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
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
          fill="#333"
          fontSize={12}
        >
          {`${value}`}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
          fontSize={12}
        >
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="overview-pie-container">
      <div className="overview-pie-title">
        <h4>{title}</h4>
        <p>{`${subtitle} ${selectedWitel}`}</p>
      </div>

      <div className="overview-pie-content">
        {loading ? (
          <Loading backgroundColor="transparent" />
        ) : error ? (
          <Error message={error} />
        ) : (
          <>
            <Dropdown
              options={witelOptions}
              value={selectedWitel}
              onChange={(e) => setSelectedWitel(e.target.value)}
            />

            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pie-desc">
              {Object.keys(filteredData)
                .filter((key) => key !== "bill_witel")
                .map((key, index) => {
                  const categoryName = key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  const isExcluded = excludedCategories.includes(categoryName);

                  return (
                    <p key={categoryName} className="category-container">
                      <input
                        className="checkbox"
                        type="checkbox"
                        checked={!isExcluded}
                        onChange={() => {
                          setExcludedCategories((prev) =>
                            isExcluded
                              ? prev.filter((name) => name !== categoryName)
                              : [...prev, categoryName]
                          );
                        }}
                      />

                      {categoryName}

                      <strong style={{ display: isExcluded ? "none" : "flex" }}>
                        → {filteredData[key]}
                      </strong>
                    </p>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
