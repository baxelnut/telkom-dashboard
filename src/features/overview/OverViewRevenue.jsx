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
} from "recharts";
import Dropdown from "../../components/utils/Dropdown";

export default function OverViewRevenue({ title, subtitle, API_URL }) {
  const [data, setData] = useState([]);
  const [selectedWitel, setSelectedWitel] = useState("BALI");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/regional_3/sheets/order_subtype_rev`
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
    value = Math.abs(Number(value));

    if (isNaN(value)) return "0";

    while (value >= 1000 && index < suffixes.length - 1) {
      value /= 1000;
      index++;
    }

    const formattedValue = `${value.toFixed(1)}${suffixes[index]}`;
    return value < 0 ? `-${formattedValue}` : formattedValue;
  };

  const chartData = useMemo(() => {
    const current = Array.isArray(data)
      ? data.find((item) => item.bill_witel === selectedWitel)
      : null;
    if (!current) return [];

    return Object.entries(current)
      .filter(([key]) => key !== "bill_witel")
      .map(([key, value]) => ({
        name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        revenue: Number(value),
      }));
  }, [data, selectedWitel]);

  const witelOptions = Array.from(
    new Set(data.map((item) => item.bill_witel))
  ).map((witel) => ({ value: witel, label: witel }));

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
              <BarChart data={chartData.sort((a, b) => b.revenue - a.revenue)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  orientation="right"
                  tickFormatter={formatValue}
                />
                <Tooltip
                  formatter={(value) => formatValue(value)}
                  labelStyle={{ fontWeight: "bold" }}
                  contentStyle={{ fontSize: "14px" }}
                />
                <Tooltip />
                <Bar dataKey="revenue" fill="#e76705" />
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
