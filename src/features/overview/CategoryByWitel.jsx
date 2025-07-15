import { useState, useMemo } from "react";
// Chart
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";
// Style
import "./CategoryByWitel.css";
// Components
import CardContent from "../../components/ui/cards/CardContent";
import Checkbox from "../../components/ui/input/Checkbox";
import Dropdown from "../../components/ui/input/Dropdown";
// Custom hook
import useFetchData from "../../hooks/useFetchData";
// Helpers
import { COLORS, CATEGORY_OPTIONS } from "../../helpers/overviewUtils";

// Custom Render
const renderActiveShape = ({
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
}) => {
  const RAD = Math.PI / 180;
  const sin = Math.sin(-RAD * midAngle);
  const cos = Math.cos(-RAD * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const anchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={12}>
        {payload.name}
      </text>
      <Sector
        {...{ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }}
      />
      <Sector
        {...{
          cx,
          cy,
          innerRadius: outerRadius + 6,
          outerRadius: outerRadius + 10,
          startAngle,
          endAngle,
          fill,
        }}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={anchor}
        fill="#333"
        fontSize={12}
      >
        {value}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={anchor}
        fill="#999"
        fontSize={12}
      >
        ({(percent * 100).toFixed(2)}%)
      </text>
    </g>
  );
};

export default function CategoryByWitel({ API_URL }) {
  const { data, loading, error } = useFetchData(
    `${API_URL}/regional-3/sheets/kategori-simplified`
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [excludedWitels, setExcludedWitels] = useState([]);

  const filteredData = useMemo(
    () => data.filter(({ new_witel }) => !excludedWitels.includes(new_witel)),
    [data, excludedWitels]
  );

  const pieData = useMemo(
    () =>
      filteredData.map((item, i) => ({
        name: item.new_witel,
        value:
          selectedCategory === "all"
            ? CATEGORY_OPTIONS.reduce(
                (acc, cat) =>
                  cat.value !== "all" ? acc + (item[cat.value] || 0) : acc,
                0
              )
            : item[selectedCategory],
        fill: COLORS[i % COLORS.length],
      })),
    [filteredData, selectedCategory]
  );

  const witelOptions = useMemo(
    () => [
      { value: "ALL", label: "ALL" },
      ...[...new Set(data.map((d) => d.new_witel))].map((witel) => ({
        value: witel,
        label: witel,
      })),
    ],
    [data]
  );

  const getWitelCount = (witel) => {
    const found = data.find((d) => d.new_witel === witel);
    return selectedCategory === "all"
      ? CATEGORY_OPTIONS.reduce(
          (sum, cat) =>
            cat.value !== "all" ? sum + (found?.[cat.value] || 0) : sum,
          0
        )
      : found?.[selectedCategory] || 0;
  };

  return (
    <div className="category-by-witel">
      <h6>Witel Pie Chart</h6>
      <p>
        Showing category of witel in{" "}
        <strong>{selectedCategory.replace(/_/g, " ").toUpperCase()}</strong>.
      </p>

      <CardContent loading={loading} error={error}>
        <Dropdown
          options={CATEGORY_OPTIONS}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          short
          chevronDown
        />

        <ResponsiveContainer width="100%" height={275}>
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
              onMouseEnter={(_, i) => setActiveIndex(i)}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="checkbox-container">
          {witelOptions.slice(1).map(({ value, label }) => {
            const isExcluded = excludedWitels.includes(value);
            return (
              <div key={value} className="witel-container">
                <Checkbox
                  label={label}
                  checked={!isExcluded}
                  onChange={() =>
                    setExcludedWitels((prev) =>
                      isExcluded
                        ? prev.filter((w) => w !== value)
                        : [...prev, value]
                    )
                  }
                />
                <h6 className="small-h">
                  {!isExcluded && `→ ${getWitelCount(value)}`}
                </h6>
              </div>
            );
          })}
        </div>
      </CardContent>
    </div>
  );
}
