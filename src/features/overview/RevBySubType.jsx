import { useState, useMemo } from "react";
// Chart
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
// Style
import "./RevBySubType.css";
// Components
import CustomTooltip from "../../components/ui/charts/CustomTooltip";
import Error from "../../components/ui/states/Error";
import Dropdown from "../../components/ui/input/Dropdown";
import Loading from "../../components/ui/states/Loading";
// Custom hook
import useFetchData from "../../hooks/useFetchData";

// Helpers
const customOrder = ["AO", "SO", "DO", "MO", "RO"];
const colorsBySegmen = {
  Government: "#FDB827",
  "Private Service": "#C70A80",
  "State-Owned Enterprise Service": "#54B435",
  Regional: "#247881",
  DEFAULT: "var(--secondary)",
};

const formatValue = (value) => {
  const suffixes = ["", "K", "M", "B"];
  let idx = 0;
  const isNeg = value < 0;
  value = Math.abs(Number(value));
  if (isNaN(value)) return "0";
  while (value >= 1000 && idx < suffixes.length - 1) {
    value /= 1000;
    idx++;
  }
  return `${isNeg ? "-" : ""}${value.toFixed(1)}${suffixes[idx]}`;
};

const getUnique = (data, key) =>
  Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);

export default function RevBySubType({ API_URL }) {
  const { data, loading, error } = useFetchData(
    `${API_URL}/regional-3/sheets/segmen/subtype2/rev`
  );

  const [selectedWitel, setSelectedWitel] = useState("ALL");
  const [selectedSegmen, setSelectedSegmen] = useState("ALL");

  const witels = data ? getUnique(data, "new_witel") : [];
  const segmens = data ? getUnique(data, "segmen") : [];

  const witelOptions = [
    { value: "ALL", label: "ALL" },
    ...witels.map((w) => ({ value: w, label: w })),
  ];
  const segmenOptions = [
    { value: "ALL", label: "ALL" },
    ...segmens.map((s) => ({ value: s, label: s })),
  ];

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const filtered = data.filter(
      (item) =>
        (selectedWitel === "ALL" || item.new_witel === selectedWitel) &&
        (selectedSegmen === "ALL" || item.segmen === selectedSegmen)
    );

    const segmenKeys = Array.from(new Set(filtered.map((d) => d.segmen)));

    const resultMap = {};

    filtered.forEach((item) => {
      const key = item.subType2;
      if (!resultMap[key]) {
        resultMap[key] = { name: key };
        segmenKeys.forEach((seg) => {
          resultMap[key][seg] = 0;
        });
      }

      const segmen = item.segmen || "DEFAULT";
      const rev = Number(item.revenue) || 0;

      resultMap[key][segmen] += ["DO", "SO"].includes(key) ? -rev : rev;
    });

    return Object.values(resultMap).sort((a, b) => {
      const idxA = customOrder.indexOf(a.name);
      const idxB = customOrder.indexOf(b.name);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [data, selectedWitel, selectedSegmen]);

  const summaryStats = useMemo(() => {
    const totalRevenue = chartData.reduce((sum, item) => {
      const segmenKeys = Object.keys(item).filter((k) => k !== "name");
      const itemTotal = segmenKeys.reduce(
        (acc, key) => acc + (item[key] || 0),
        0
      );
      return sum + itemTotal;
    }, 0);

    const topCategories = [...chartData]
      .map((item) => ({
        name: item.name,
        value: Object.keys(item)
          .filter((k) => k !== "name")
          .reduce((acc, key) => acc + (item[key] || 0), 0),
      }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 2);

    return {
      totalRevenue,
      count: chartData.length,
      topCategories,
    };
  }, [chartData]);

  return (
    <div className="card rev-by-order-sub-type">
      <h6>Revenue by Order Sub-type</h6>

      {loading ? (
        <Loading backgroundColor="transparent" />
      ) : error ? (
        <Error message={error} />
      ) : (
        <div className="card-content">
          <div className="filter-container">
            <div className="dropdown-container">
              <p>Select witel:</p>
              <Dropdown
                options={witelOptions}
                value={selectedWitel}
                onChange={(e) => setSelectedWitel(e.target.value)}
                chevronDown
                short
              />
            </div>
            <div className="dropdown-container">
              <p>Select segmen:</p>
              <Dropdown
                options={segmenOptions}
                value={selectedSegmen}
                onChange={(e) => setSelectedSegmen(e.target.value)}
                chevronDown
                short
              />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "var(--text)" }}
              />
              <YAxis
                orientation="right"
                tickFormatter={formatValue}
                tick={{ fontSize: 12, fill: "var(--text)" }}
                domain={[-"auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip formatter={formatValue} />} />
              <Legend
                layout="horizontal"
                verticalAlign="top"
                align="left"
                wrapperStyle={{
                  fontFamily: "var(--body)",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "var(--text)",
                  lineHeight: "1",
                }}
              />
              <ReferenceLine y={0} stroke="#000" />

              {selectedSegmen === "ALL" ? (
                segmens.map((seg) => (
                  <Bar
                    key={seg}
                    dataKey={seg}
                    stackId="a"
                    fill={colorsBySegmen[seg] || colorsBySegmen.DEFAULT}
                  />
                ))
              ) : (
                <Bar
                  dataKey={selectedSegmen}
                  stackId="a"
                  fill={
                    colorsBySegmen[selectedSegmen] || colorsBySegmen.DEFAULT
                  }
                />
              )}
            </BarChart>
          </ResponsiveContainer>
          <p>
            Showing revenue for <strong>{selectedSegmen}</strong> segmen in{" "}
            <strong>{selectedWitel}</strong> witel.
          </p>

          <div className="summary-container">
            <h6 className="small-h">Summary:</h6>
            <p>
              <strong>{summaryStats.count}</strong> revenue categories analyzed
              totaling{" "}
              <strong>{`IDR ${formatValue(
                summaryStats.totalRevenue
              )}.`}</strong>{" "}
              {summaryStats.topCategories.length > 0 && (
                <>
                  Top contributors:{" "}
                  <strong>
                    {summaryStats.topCategories.map((t) => t.name).join(" & ")}
                  </strong>
                  .
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
