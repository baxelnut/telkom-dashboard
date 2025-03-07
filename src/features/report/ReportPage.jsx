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

        const data = await response.json();

        // console.log("🔥 Processed Data:", renamedData);
        setReportData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []);

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
      {/* <pre>{JSON.stringify(reportData, null, 2)}</pre> */}
    </div>
  );
}
