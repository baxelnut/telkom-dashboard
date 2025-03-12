import React, { useState, useEffect } from "react";
import "./ReportPage.css";
import ReportTable from "./ReportTable";
import Loading from "../../components/Loading";
import ReportTableDetails from "./ReportTableDetails";

export default function ReportPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFromChild, setDataFromChild] = useState(null);

  const handleChildData = (filteredData) => {
    setDataFromChild(filteredData);
  };

  const goBack = () => {
    setDataFromChild(null);
  };

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:5000/api/report");
        if (!response.ok) throw new Error("Failed to fetch report data");

        const data = await response.json();
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
          {dataFromChild ? (
            <>
              <h5>{dataFromChild.witelName || "Unknown"} - {dataFromChild.statusType}</h5>
              <h6>Periode: {dataFromChild["<3Bln"] ? "<3 BLN" : ">3 BLN"}</h6>
            </>
          ) : (
            <>
              <h5>REPORT</h5>
              <h6>Periode: ALL</h6>
            </>
          )}

          <div className="table">
            {loading ? (
              <Loading />
            ) : dataFromChild ? (
              /** Show Details Table if there's data */
              <div>
                <button onClick={goBack} className="back-button">
                  <h6>← Back</h6>
                </button>
                <ReportTableDetails filteredData={dataFromChild} />
              </div>
            ) : (
              /** Show Main Table */
              <ReportTable
                data={reportData}
                error={error}
                loading={loading}
                sendDataToParent={handleChildData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
