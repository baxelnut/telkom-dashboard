import React, { useEffect, useState } from "react";
import "./OverviewTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";
import Dropdown from "../../components/utils/Dropdown";
import Pagination from "../../components/table/Pagination";
import TableScroll from "../../components/table/TableScroll";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const rowPerPageOptions = [10, 20, 50, 100, 200, 500, 1000].map((value) => ({
  value,
  label: `Show ${value} rows`,
}));

const exportOptions = [..."Excel CSV".split(" ")].map((value) => ({
  value,
  label: value,
}));

export default function OverviewTable({ API_URL }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedExport, setSelectedExport] = useState("Excel");

  const fetchData = async (page, limit) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/regional_3?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        const responseText = await response.text();
        console.error("🚨 API Fetch Error:", responseText);
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      setData(result.data);

      setTotalRows(result.total ?? result.data.length ?? 0);
    } catch (err) {
      console.error("API Error:", err);
      res.status(500).json({
        error: err.message || "An unexpected error occurred.",
        stack: err.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage + 1, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  const pageCount = Math.ceil(totalRows / rowsPerPage);

  const handleExport = async (type) => {
    setSelectedExport(type);

    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    if (type === "Excel") {
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Data Overview.xlsx");
    } else if (type === "CSV") {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "Data Overview.csv");
    }

    console.log("✅ Exported as", type);
  };

  return (
    <div className="overview-table">
      <div className="overview-table-title">
        <h5>
          Data Overview
          <p className="debug-info">
            {`( Total rows: ${totalRows
              .toLocaleString("id-ID")
              .replace(",", ".")} )`}
          </p>
        </h5>

        <div style={{ flex: 1 }}>
          <Dropdown
            options={rowPerPageOptions}
            value={rowsPerPage}
            onChange={(e) => setRowPerPage(Number(e.target.value))}
          />
        </div>

        <div className="filter-container">
          <p className="label">Export as:</p>
          <Dropdown
            options={exportOptions}
            value={selectedExport}
            onChange={(e) => handleExport(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <Loading backgroundColor="transparent" />
        ) : error || data.length === 0 ? (
          <Error message={error} />
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
