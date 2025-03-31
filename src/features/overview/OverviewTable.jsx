import React, { useEffect, useState } from "react";
import "./OverviewTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";
import Dropdown from "../../components/utils/Dropdown";
import Pagination from "../../components/table/Pagination";
import TableScroll from "../../components/table/TableScroll";

const rowPerPageOptions = [10, 20, 50, 100, 200].map((value) => ({
  value,
  label: `Show ${value} rows`,
}));

export default function OverviewTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0);

  const API_URL = import.meta.env.VITE_DEV_API;

  const fetchData = async (page, limit) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/aosodomoro?page=${page}&limit=${limit}`
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      setData(result.data);
      setTotalRows(result.total);
    } catch (error) {
      console.error("🚨 API Fetch Error:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage + 1, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  const pageCount = Math.ceil(totalRows / rowsPerPage);

  return (
    <div className="overview-table">
      <div className="overview-table-title">
        <h5>
          Data Overview
          <p className="debug-info">{`( Total rows: ${totalRows
            .toLocaleString("id-ID")
            .replace(",", ".")} )`}</p>
        </h5>

        <Dropdown
          options={rowPerPageOptions}
          value={rowsPerPage}
          onChange={(e) => setRowPerPage(Number(e.target.value))}
        />
      </div>

      <div className="table-wrapper">
        {loading ? (
          <Loading backgroundColor="transparent" />
        ) : error ? (
          <Error message={error} />
        ) : data.length === 0 ? (
          <p>No data available.</p>
        ) : (
          <TableScroll
            data={data}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
          />
        )}
      </div>

      {data.length > 0 && (
        <Pagination
          pageCount={pageCount}
          onPageChange={(selectedPage) => setCurrentPage(selectedPage)}
        />
      )}
    </div>
  );
}
