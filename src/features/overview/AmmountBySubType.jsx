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
} from "recharts";
// Style
import "./AmmountBySubType.css";
// Components
import Error from "../../components/ui/states/Error";
import Dropdown from "../../components/ui/input/Dropdown";
import Loading from "../../components/ui/states/Loading";
// Custom hook
import useFetchData from "../../hooks/useFetchData";
import CustomTooltip from "../../components/ui/charts/CustomTooltip";

// Helpers
const customOrder = ["AO", "SO", "DO", "MO", "RO"];
const colorsBySegmen = {
  Government: "#FDB827",
  "Private Service": "#C70A80",
  "State-Owned Enterprise Service": "#54B435",
  Regional: "#247881",
  DEFAULT: "var(--secondary)",
};

export default function AmmountBySubType({ API_URL }) {
  const { data, loading, error } = useFetchData(
    `${API_URL}/regional-3/sheets/segmen/subtype2`
  );

  const [selectedWitel, setSelectedWitel] = useState("ALL");
  const [selectedSegmen, setSelectedSegmen] = useState("ALL");

  const uniqueWitels = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((item) => item.new_witel))).filter(
      Boolean
    );
  }, [data]);

  const uniqueSegmens = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((item) => item.segmen))).filter(Boolean);
  }, [data]);

  const witelOptions = [
    { value: "ALL", label: "ALL" },
    ...uniqueWitels.map((w) => ({ value: w, label: w })),
  ];
  const segmenOptions = [
    { value: "ALL", label: "ALL" },
    ...uniqueSegmens.map((s) => ({ value: s, label: s })),
  ];

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    const filtered = data.filter((item) => {
      const witelMatch =
        selectedWitel === "ALL" || item.new_witel === selectedWitel;
      const segmenMatch =
        selectedSegmen === "ALL" || item.segmen === selectedSegmen;
      return witelMatch && segmenMatch;
    });

    const grouped = {};
    filtered.forEach(({ subType2, segmen, quantity }) => {
      const key = subType2 || "UNKNOWN";
      const seg = segmen || "UNKNOWN";
      const rev = Number(quantity) || 0;

      if (!grouped[key]) grouped[key] = { name: key };
      grouped[key][seg] = (grouped[key][seg] || 0) + rev;
    });

    return Object.values(grouped).sort((a, b) => {
      const idxA = customOrder.indexOf(a.name);
      const idxB = customOrder.indexOf(b.name);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [data, selectedWitel, selectedSegmen]);

  return (
    <div className="card ammount-by-subtype">
      <h6>Amount by Order Sub-type</h6>

      {loading ? (
        <Loading backgroundColor="transparent" />
      ) : error ? (
        <Error message={error} />
      ) : (
        <div className="card-content">
          <div className="filter-container">
            <div className="dropdown-container">
              <p>Select Witel:</p>
              <Dropdown
                value={selectedWitel}
                onChange={(e) => setSelectedWitel(e.target.value)}
                options={witelOptions}
                chevronDown
                short
              />
            </div>
            <div className="dropdown-container">
              <p>Select Segmen:</p>
              <Dropdown
                value={selectedSegmen}
                onChange={(e) => setSelectedSegmen(e.target.value)}
                options={segmenOptions}
                chevronDown
                short
              />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "var(--text)" }}
              />
              <YAxis
                orientation="right"
                tick={{ fontSize: 12, fill: "var(--text)" }}
              />
              <Tooltip content={<CustomTooltip />} />
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

              {(selectedSegmen === "ALL"
                ? uniqueSegmens
                : [selectedSegmen]
              ).map((seg) => (
                <Bar
                  key={seg}
                  dataKey={seg}
                  stackId="a"
                  fill={colorsBySegmen[seg] || colorsBySegmen.DEFAULT}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>

          <p style={{ marginTop: "1rem" }}>
            Showing data for <strong>{selectedSegmen}</strong> segmen in{" "}
            <strong>{selectedWitel}</strong> witel.
          </p>
        </div>
      )}
    </div>
  );
}
