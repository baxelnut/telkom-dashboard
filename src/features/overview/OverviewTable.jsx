import React, { useEffect, useState } from "react";
import "./OverviewTable.css";

export default function OverviewTable({ title }) {
  const [data, setData] = useState([]);

  const API_URL = import.meta.env.VITE_DEV_API;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/aosodomoro`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();

        setData(result.slice(0, 10));

        console.log(`📊 Total items: ${result.length}`);
      } catch (error) {
        console.error("🚨 API Fetch Error:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="overview-table">
      <h5>{title}</h5>

      <div className="table-wrapper">
        {data.length > 0 ? (
          <table>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
