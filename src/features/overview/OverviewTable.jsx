import React, { useEffect, useState } from "react";
import "./OverviewTable.css";
import Loading from "../../components/Loading";
import Error from "../../components/Error";

export default function OverviewTable({ title }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_DEV_API;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/aosodomoro`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result.slice(0, 10));
        console.log(`📊 Total items: ${result.length}`);
      } catch (error) {
        console.error("🚨 API Fetch Error:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="overview-table">
      <h5>{title}</h5>

      <div className="table-wrapper">
        {loading ? (
          <Loading />
        ) : error ? (
          <Error message={error} />
        ) : data.length > 0 ? (
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
          <p>No data available</p>
        )}
      </div>
    </div>
  );
}
