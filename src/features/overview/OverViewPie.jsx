import React, { useState, useEffect, useMemo } from "react";
import "./OverViewPie.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";
import Dropdown from "../../components/utils/Dropdown";
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";

const colorSet = ["#5cb338", "#e76705", "#2DAA9E", "#D91656", "#7C4585"];

export default function OverViewPie({ title, subtitle, API_URL }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [excludedWitels, setExcludedWitels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/regional_3/sheets/kategori_simplified`
        );
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

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "ALL" },
      { value: "in_process", label: "In Process" },
      { value: "prov_complete", label: "Prov Complete" },
      { value: "provide_order", label: "Provide Order" },
      { value: "ready_to_bill", label: "Ready to Bill" },
    ],
    []
  );

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

  const filteredData = useMemo(() => {
    return data.filter((item) => !excludedWitels.includes(item.bill_witel));
  }, [data, excludedWitels]);

  const pieData = useMemo(() => {
    if (selectedCategory === "all") {
      return filteredData.map((item, index) => ({
        name: item.bill_witel,
        value: Object.keys(item).reduce((acc, key) => {
          if (categoryOptions.some((cat) => cat.value === key)) {
            acc += item[key];
          }
          return acc;
        }, 0),
        fill: colorSet[index % colorSet.length],
      }));
    }

    return filteredData.map((item, index) => ({
      name: item.bill_witel,
      value: item[selectedCategory],
      fill: colorSet[index % colorSet.length],
    }));
  }, [filteredData, selectedCategory, categoryOptions]);

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
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  const getWitelCategoryQuantity = (witel, category) => {
    const witelData = data.find((item) => item.bill_witel === witel);

    if (witelData) {
      return witelData[category] || 0;
    }

    return 0;
  };

  return (
    <div className="overview-pie-container">
      <div className="overview-pie-title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>

      <div className="overview-pie-content">
        {loading ? (
          <Loading backgroundColor="transparent" />
        ) : error ? (
          <Error message={error} />
        ) : (
          <>
            <Dropdown
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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

            <div className="checkbox-container">
              {witelOptions
                .filter((option) => option.value !== "ALL")
                .map((option) => {
                  const isExcluded = excludedWitels.includes(option.value);
                  return (
                    <p key={option.value} className="witel-container">
                      <input
                        className="checkbox"
                        type="checkbox"
                        checked={!isExcluded}
                        onChange={() => {
                          setExcludedWitels((prev) =>
                            isExcluded
                              ? prev.filter((name) => name !== option.value)
                              : [...prev, option.value]
                          );
                        }}
                      />
                      {option.label}
                      <div className="category-quantities">
                        <strong
                          style={{ display: isExcluded ? "none" : "flex" }}
                        >
                          →{" "}
                          {selectedCategory === "all"
                            ? pieData.find((item) => item.name === option.value)
                                ?.value
                            : getWitelCategoryQuantity(
                                option.value,
                                selectedCategory
                              )}
                        </strong>
                      </div>
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
