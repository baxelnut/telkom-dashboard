import React, { useState, useEffect } from "react";
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
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { fullName, quantity } = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "var(--surface)",
          padding: "14px",
          borderRadius: "6px",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        <p style={{ margin: 0 }}>{fullName}</p>
        <p style={{ margin: 0 }}>Quantity: {quantity}</p>
      </div>
    );
  }

  return null;
};

export default function OverViewBar({ title, subtitle, API_URL }) {
  const [data, setData] = useState([]);
  const [selectedWitel, setSelectedWitel] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/regional_3/sheets/segmen`);
        const result = await response.json();
        setData(result.data);
        setLoading(false);
      } catch (error) {
        setError(error.message || "Something went wrong while fetching data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const segmenLabelMap = {
    "State-Owned Enterprise Service": "SOES",
    // add more mappings if needed
  };

  const chartData = (() => {
    if (!Array.isArray(data)) return [];

    const filtered =
      selectedWitel === "ALL"
        ? data
        : data.filter((item) => item.bill_witel === selectedWitel);

    const aggregated = {};

    filtered.forEach((item) => {
      if (!aggregated[item.segmen]) {
        aggregated[item.segmen] = 0;
      }
      aggregated[item.segmen] += Number(item.quantity);
    });

    return Object.entries(aggregated).map(([segmen, quantity]) => ({
      name: segmenLabelMap[segmen] || segmen,
      fullName: segmen,
      quantity,
    }));
  })();

  const uniqueWitels = Array.from(new Set(data.map((item) => item.bill_witel)));
  const witelOptions = [
    { value: "ALL", label: "ALL" },
    ...uniqueWitels.map((witel) => ({ value: witel, label: witel })),
  ];

  const handleChange = (e) => {
    setSelectedWitel(e.target.value);
  };

  return (
    <div className="overview-bar-container">
      <div className="overview-bar-title">
        <h4>{title}</h4>
        <p>{`${subtitle} ${selectedWitel}`}</p>
      </div>

      <div className="overview-bar-content">
        {loading ? (
          <Loading backgroundColor="transparent" />
        ) : error ? (
          <Error message={error} />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData.sort((a, b) => a.quantity - b.quantity)}
              >
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
                  labelFormatter={(value, payload) => {
                    const fullName = payload?.[0]?.payload?.fullName;
                    return fullName || value;
                  }}
                  labelStyle={{ fontWeight: "bold" }}
                  contentStyle={{
                    fontSize: "14px",
                    backgroundColor: "var(--surface)",
                    padding: "14px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                  }}
                />
                <Bar dataKey="quantity" fill="#e76705" />
              </BarChart>
            </ResponsiveContainer>

            <Dropdown
              options={witelOptions}
              value={selectedWitel}
              onChange={handleChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
