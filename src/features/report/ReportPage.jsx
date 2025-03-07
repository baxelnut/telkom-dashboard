import React, { useState, useEffect } from "react";
import "./ReportPage.css";
import ReportTable from "./ReportTable";
import Loading from "../../components/Loading";

export default function ReportPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:5000/api/report");
        if (!response.ok) throw new Error("Failed to fetch report data");

        const rawData = await response.json();
        setReportData(rawData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []);

  function processData(processedData) {
    return processedData.reduce((acc, row) => {
      const witel = row["SERVICE_WITEL"];
      const kategoriUmur = row["KATEGORI_UMUR"];
      const kategori = row["KATEGORI"];
      const revenue = parseFloat(row["REVENUE"]) || 0;

      if (!acc[witel]) {
        acc[witel] = {
          "<3 bulan": 0,
          ">3 bulan": 0,
          "PROVIDE ORDER": { count: 0, revenue: 0 },
          "IN PROCESS": { count: 0, revenue: 0 },
          "READY TO BILL": { count: 0, revenue: 0 },
        };
      }

      if (kategoriUmur === "< 3 BLN") acc[witel]["<3 bulan"]++;
      if (kategoriUmur === "> 3 BLN") acc[witel][">3 bulan"]++;

      if (kategori in acc[witel]) {
        acc[witel][kategori].count++;
        acc[witel][kategori].revenue += revenue;
      }

      return acc;
    }, {});
  }

  return (
    <div className="report">
      <div className="content">
        <div className="periode-filter">
          <h6>Periode</h6>
          <div className="filter-box">
            <div className="filter-field">
              <h6>ALL</h6>
            </div>
            <p>Select periode...</p>
          </div>
        </div>
        <div className="table-container">
          <h5>LOREM IPSUM DOLOR SIT AMET</h5>
          <h6>Periode: ALL</h6>
          <div className="table">
            {loading ? (
              <Loading />
            ) : (
              <ReportTable data={reportData} error={error} loading={loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
