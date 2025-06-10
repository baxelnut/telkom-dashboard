import React, { useState, useEffect, useMemo } from "react";
import "./OverViewRevenue.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";
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
import Dropdown from "../../components/utils/Dropdown";

export default function OverViewRevenue({ title, API_URL }) {
  const [data, setData] = useState([]);
  const [selectedWitel, setSelectedWitel] = useState("ALL");
  const [selectedSegmen, setSelectedSegmen] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const customOrder = ["AO", "SO", "DO", "MO", "RO"];

  const colorsBySegmen = {
    Government: "#FDB827",
    "Private Service": "#C70A80",
    "State-Owned Enterprise Service": "#54B435",
    Regional: "#247881",
    DEFAULT: "var(--secondary)",
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/regional_3/sheets/segmen/subtype2/rev`
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`API Error ${response.status}: ${text}`);
        }

        const result = await response.json();

        if (!Array.isArray(result.data)) {
          throw new Error(
            "Invalid response structure: expected array in result.data"
          );
        }

        setData(result.data);
      } catch (err) {
        console.error("🚨 Error Fetching Filtered Data:", err);
        setError(err.message || "Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatValue = (value) => {
    const suffixes = ["", "K", "M", "B"];
    let index = 0;
    const isNegative = value < 0;
    value = Math.abs(Number(value));
    if (isNaN(value)) return "0";

    while (value >= 1000 && index < suffixes.length - 1) {
      value /= 1000;
      index++;
    }

    const formattedValue = `${value.toFixed(1)}${suffixes[index]}`;
    return isNegative ? `-${formattedValue}` : formattedValue;
  };

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const filtered = data.filter((item) => {
      return (
        (selectedWitel === "ALL" || item.new_witel === selectedWitel) &&
        (selectedSegmen === "ALL" || item.segmen === selectedSegmen)
      );
    });

    const segmens = Array.from(new Set(filtered.map((d) => d.segmen)));

    const resultMap = {};
    filtered.forEach((item) => {
      const key = item.subType2;
      if (!resultMap[key]) {
        resultMap[key] = { name: key };
        segmens.forEach((seg) => {
          resultMap[key][seg] = 0;
        });
      }

      const segmen = item.segmen || "DEFAULT";
      const revenue = Number(item.revenue) || 0;

      resultMap[key][segmen] +=
        key === "DO" || key === "SO" ? -revenue : revenue;
    });

    return Object.values(resultMap).sort((a, b) => {
      const idxA = customOrder.indexOf(a.name);
      const idxB = customOrder.indexOf(b.name);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [data, selectedWitel, selectedSegmen]);

  const uniqueWitels = Array.from(new Set(data.map((item) => item.new_witel)));
  const witelOptions = [
    { value: "ALL", label: "ALL" },
    ...uniqueWitels.map((witel) => ({ value: witel, label: witel })),
  ];

  const uniqueSegmens = Array.from(new Set(data.map((item) => item.segmen)));

  const segmenOptions = [
    { value: "ALL", label: "ALL" },
    ...Array.from(new Set(data.map((d) => d.segmen))).map((seg) => ({
      value: seg,
      label: seg,
    })),
  ];

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
    <div className="overtime-container">
      <div className="overview-bar-title">
        <h4>{title}</h4>
      </div>

      <div className="overview-bar-content">
        {loading ? (
          <Loading backgroundColor="transparent" />
        ) : error ? (
          <Error message={error} />
        ) : (
          <>
            <div className="filters-container">
              <div className="dropdown-filter">
                <p>Select witel:</p>
                <Dropdown
                  options={witelOptions}
                  value={selectedWitel}
                  onChange={(e) => setSelectedWitel(e.target.value)}
                />
              </div>
              <div className="dropdown-filter">
                <p>Select segmen:</p>
                <Dropdown
                  options={segmenOptions}
                  value={selectedSegmen}
                  onChange={(e) => setSelectedSegmen(e.target.value)}
                />
              </div>
            </div>

            <ResponsiveContainer width="100%" height={310}>
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
                  minTickGap={10}
                />
                <Tooltip
                  formatter={(value) => formatValue(value)}
                  labelStyle={{ fontWeight: "bold" }}
                  contentStyle={{
                    fontSize: "14px",
                    backgroundColor: "var(--surface)",
                    padding: "14px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                  }}
                />
                <Legend layout="horizontal" verticalAlign="top" align="left" />
                <ReferenceLine y={0} stroke="#000" />

                {selectedSegmen === "ALL" ? (
                  uniqueSegmens.map((seg) => (
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

            <p style={{ paddingTop: "0.5rem" }}>
              Showing revenue for <strong>{selectedSegmen}</strong> segmen in{" "}
              <strong>{selectedWitel}</strong> witel.
            </p>

            <div className="summary-container">
              <h6>Summary: </h6>
              <p>
                <strong>{summaryStats.count}</strong> revenue categories
                analyzed totaling{" "}
                <strong>{`IDR ${formatValue(
                  summaryStats.totalRevenue
                )}.`}</strong>{" "}
                {summaryStats.topCategories.length > 0 && (
                  <>
                    {"Top contributors: "}
                    <strong>
                      {summaryStats.topCategories
                        .map((t) => t.name)
                        .join(" & ")}
                    </strong>
                    .
                  </>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
