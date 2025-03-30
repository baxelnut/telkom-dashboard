import React, { useEffect, useState } from "react";
import "./OverviewTable.css";

export default function OverviewTable({ title }) {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 100;
  const API_URL = import.meta.env.VITE_DEV_API;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/data`);

        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result.data);
        setTotalItems(result.total); // Get total items count from backend

        console.log(`📊 Total items: ${result.total}`);
        console.log(
          `📑 Showing ${result.data.length} items on page ${currentPage}`
        );
      } catch (error) {
        console.error("🚨 API Fetch Error:", error);
      }
    };

    fetchData();
  }, [currentPage]); // Re-fetch data when page changes

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  console.log(`${API_URL}/data`);

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

      {/* 🔥 Pagination Controls */}
      {totalItems > itemsPerPage && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ⬅️ Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
}
