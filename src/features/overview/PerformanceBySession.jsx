import React, { useState, useEffect } from "react";
import "./PerformanceBySession.css";
import Loading from "../../components/Loading";

export default function PerformanceBySession({ columnName, title, subtitle }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/data");
        if (!response.ok) throw new Error("Failed to fetch data");

        const fileData = await response.json();
        if (!Array.isArray(fileData) || fileData.length === 0) {
          setLoading(false);
          return;
        }

        const customerCounts = fileData.reduce((acc, row) => {
          const customer = row[columnName] || "Unknown";
          acc[customer] = (acc[customer] || 0) + 1;
          return acc;
        }, {});

        const sortedData = Object.entries(customerCounts)
          .map(([name, sessions]) => ({ name, sessions }))
          .sort((a, b) => b.sessions - a.sessions)
          .slice(0, 5);

        const totalSessions = Object.values(customerCounts).reduce(
          (sum, count) => sum + count,
          0
        );

        const processedData = sortedData.map((customer) => ({
          name: customer.name,
          sessions: customer.sessions,
          percentage: (customer.sessions / totalSessions) * 100,
        }));

        setData(processedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [columnName]);

  if (loading)
    return (
      <div className="p-by-session">
        <Loading />
      </div>
    );
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-by-session">
      <div className="title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>
      <div className="main">
        {data.length === 0 ? (
          <p>No data available.</p>
        ) : (
          data.map((customer, index) => (
            <div className="widget" key={index}>
              <div className="head">
                <h6 title={customer.name}>{customer.name}</h6>
                <h6>
                  {customer.sessions} • {customer.percentage.toFixed(2)}%
                </h6>
              </div>
              <div className="bar">
                <div
                  className="active"
                  style={{ width: `${customer.percentage}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
