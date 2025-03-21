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
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const handleChildData = (updatedData) => {
    setDataFromChild(updatedData);
    saveToServer(updatedData);
  };

  const skedaddle = (data) => {
    saveToServer(data);
    setDataFromChild(null);
  };

  const saveToServer = async (data) => {
    try {
      const response = await fetch("http://localhost:5000/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("✅ Data saved:", result.message);
    } catch (error) {
      console.error("❌ Error saving data:", error);
    }
  };

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(null);

      try {
        let response = await fetch("http://localhost:5000/save-json");
        if (!response.ok) throw new Error("Fallback to /api/report");

        const data = await response.json();
        setReportData(data);
        console.log("✅ Loaded from /save-json");
      } catch (err) {
        console.warn("⚠️ /save-json not found, using /api/report instead");

        try {
          const response = await fetch("http://localhost:5000/api/report");
          if (!response.ok) throw new Error("Failed to fetch report data");

          const data = await response.json();
          setReportData(data);
          console.log("✅ Loaded from /api/report");
        } catch (finalErr) {
          setError(finalErr.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []);

  const filteredReportData =
    selectedCategory === "ALL"
      ? reportData
      : reportData.map((witel) => ({
          ...witel,
          "PROVIDE ORDER": {
            ...witel["PROVIDE ORDER"],
            ">3blnItems": witel["PROVIDE ORDER"][">3blnItems"].filter(
              (item) => item.category === selectedCategory
            ),
            "<3blnItems": witel["PROVIDE ORDER"]["<3blnItems"].filter(
              (item) => item.category === selectedCategory
            ),
          },
          "IN PROCESS": {
            ...witel["IN PROCESS"],
            ">3blnItems": witel["IN PROCESS"][">3blnItems"].filter(
              (item) => item.category === selectedCategory
            ),
            "<3blnItems": witel["IN PROCESS"]["<3blnItems"].filter(
              (item) => item.category === selectedCategory
            ),
          },
          "READY TO BILL": {
            ...witel["READY TO BILL"],
            ">3blnItems": witel["READY TO BILL"][">3blnItems"].filter(
              (item) => item.category === selectedCategory
            ),
            "<3blnItems": witel["READY TO BILL"]["<3blnItems"].filter(
              (item) => item.category === selectedCategory
            ),
          },
        }));

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
            <div className="table-container-header">
              <div>
                <h5>
                  {dataFromChild.witelName || "Unknown"} -{" "}
                  {dataFromChild.statusType}
                </h5>
                <h6>Periode: {dataFromChild["<3Bln"] ? "<3 BLN" : ">3 BLN"}</h6>
              </div>
              <button
                onClick={() => skedaddle(filteredReportData)}
                className="back-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <h5>REPORT</h5>
              <div className="filter-container">
                <label>Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="ALL">All</option>
                  <option value="AO">AO</option>
                  <option value="SO">SO</option>
                  <option value="DO">DO</option>
                  <option value="MO">MO</option>
                  <option value="RO">RO</option>
                </select>
              </div>
            </>
          )}

          <div className="table">
            {loading ? (
              <div className="overview-card-placeholder">
                <Loading />
              </div>
            ) : dataFromChild ? (
              <div className="details-container">
                <ReportTableDetails
                  filteredData={dataFromChild}
                  onUpdateStatus={handleChildData}
                />
              </div>
            ) : (
              <>
                <ReportTable
                  data={filteredReportData}
                  error={error}
                  loading={loading}
                  sendDataToParent={handleChildData}
                />
              </>
            )}
          </div>
        </div>

        {/* <div className="💪">
          <button
            type="button"
            onClick={() => saveToServer(filteredReportData)}
          >
            Save to database
          </button>
          <div className="b4-AF">
            <pre>
              <h6>JSON</h6> <br />
              {JSON.stringify(filteredReportData, null, 2)}
            </pre>
          </div>
        </div> */}
      </div>
    </div>
  );
}
