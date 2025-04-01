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

export default function OverViewBar({ title, subtitle, API_URL }) {
  const [data, setData] = useState([]);
  const [selectedWitel, setSelectedWitel] = useState("BALI");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/aosodomoro/reg_3_subsegmen`);
        const result = await response.json();
        setData(result.data);
        setLoading(false);
      } catch (error) {
        setError(error.message || "Something went wrong while fetching data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const filteredData = data.filter((item) => item.bill_witel === selectedWitel);

  const chartData = filteredData.map((item) => ({
    name: item.sub_segmen_name,
    quantity: item.quantity,
  }));

  console.log("Chart Data:", chartData);

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
        <p>{`${subtitle}: ${selectedWitel}`}</p>
      </div>

      <div className="overview-bar-content">
        {loading ? (
          <Loading backgroundColor="transparent" />
        ) : error ? (
          <Error message={error} />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData.sort((a, b) => a.quantity - b.quantity)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} orientation="right" />
                <Tooltip />
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
