import React, { useState, useEffect, useMemo } from "react";
import "./OverViewBar.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";
import Dropdown from "../../components/utils/Dropdown";
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

export default function OverViewBar({ title, API_URL }) {
  const [data, setData] = useState([]);
  const [selectedWitel, setSelectedWitel] = useState("ALL");
  const [selectedSegmen, setSelectedSegmen] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/regional_3/sheets/segmen/subtype2`
        );
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err.message || "Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const customOrder = ["AO", "SO", "DO", "MO", "RO"];

  const segmenOptions = [
    { value: "ALL", label: "ALL" },
    ...Array.from(new Set(data.map((d) => d.segmen))).map((seg) => ({
      value: seg,
      label: seg,
    })),
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
      if (!grouped[subType2]) grouped[subType2] = { name: subType2 };
      grouped[subType2][segmen] =
        (grouped[subType2][segmen] || 0) + Number(quantity);
    });

    return Object.values(grouped).sort((a, b) => {
      const idxA = customOrder.indexOf(a.name);
      const idxB = customOrder.indexOf(b.name);
      const orderA = idxA === -1 ? customOrder.length : idxA;
      const orderB = idxB === -1 ? customOrder.length : idxB;
      return orderA - orderB;
    });
  }, [data, selectedWitel, selectedSegmen]);

  const uniqueWitels = Array.from(new Set(data.map((item) => item.new_witel)));
  const witelOptions = [
    { value: "ALL", label: "ALL" },
    ...uniqueWitels.map((witel) => ({ value: witel, label: witel })),
  ];

  const uniqueSegmens = Array.from(
    new Set(data.map((item) => item.segmen))
  ).filter((s) => selectedSegmen === "ALL" || s === selectedSegmen);

  const colorsBySegmen = {
    Government: "#FDB827",
    "Private Service": "#C70A80",
    "State-Owned Enterprise Service": "#54B435",
    Regional: "#247881",
    DEFAULT: "var(--secondary)",
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            style={{
              fontFamily: "var(--body)",
              fontSize: "14px",
              fontWeight: "400",
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              margin: 0,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                backgroundColor: entry.color,
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>
            {entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="overview-bar-container">
      <div className="overview-bar-title">
        <h4>{title}</h4>
      </div>

      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}

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

            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "var(--text)" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--text)" }}
                  orientation="right"
                />
                <Tooltip
                  labelStyle={{ fontWeight: "bold" }}
                  contentStyle={{
                    fontSize: "14px",
                    backgroundColor: "var(--surface)",
                    padding: "14px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                  }}
                />
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
              Showing data for <strong>{selectedSegmen}</strong> segmen in{" "}
              <strong>{selectedWitel}</strong> witel.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
