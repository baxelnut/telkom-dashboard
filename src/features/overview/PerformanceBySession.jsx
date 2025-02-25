import React, { useState, useEffect } from "react";
import { readFile } from "../../service/data/readExcel";
import "./PerformanceBySession.css";
import Loading from "../../components/Loading";

export default function PerformanceBySession({ filePath, columnName }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const fileData = await readFile(filePath);
      if (!fileData || fileData.length === 0) {
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
      setLoading(false);
    }

    fetchData();
  }, [filePath, columnName]);

  return (
    <div className="p-by-session">
      <div className="title">
        <h4>Session by Customer</h4>
        <p>Showing data for top customers</p>
      </div>
      <div className="main">
        {loading ? (
          <Loading />
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
