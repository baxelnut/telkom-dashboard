import React, { useState, useEffect } from "react";
import "./ActionPage.css";
import Dropdown from "../../components/utils/Dropdown";
import ActionTable from "./ActionTable";
import ActionSelectedTable from "./ActionSelectedTable";

export default function ActionPage({ API_URL, userEmail }) {
  const [poData, setPoData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [enrichedData, setEnrichedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedWitel, setSelectedWitel] = useState(null);
  const [witelOptions, setWitelOptions] = useState([
    { value: "ALL", label: "ALL" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [poRes, reportRes] = await Promise.all([
          fetch(`${API_URL}/regional_3/sheets/po`),
          fetch(`${API_URL}/regional_3/report`),
        ]);

        if (!poRes.ok || !reportRes.ok)
          throw new Error("❌ One of the API calls failed");

        const poJson = await poRes.json();
        const reportJson = await reportRes.json();

        setPoData(poJson.data);
        setReportData(reportJson.data);

        const uniqueWitels = [
          ...new Set(poJson.data.map((row) => row.WITEL).filter(Boolean)),
        ];
        setWitelOptions([
          { value: "ALL", label: "ALL" },
          ...uniqueWitels.map((witel) => ({ value: witel, label: witel })),
        ]);

        const processedData = poJson.data.map((poItem) => {
          const witel = poItem.BILL_WITEL;
          const reportEntry = reportJson.data.find(
            (r) => r.witelName === witel
          );

          let totalInProcess = 0;
          const actionCounts = {
            LANJUT: 0,
            CANCEL: 0,
            "BUKAN ORDER REG": 0,
          };

          if (reportEntry) {
            for (const [subType, subObj] of Object.entries(reportEntry)) {
              if (subType === "witelName") continue;

              const under3 = subObj["<3blnItems"] || [];
              const over3 = subObj[">3blnItems"] || [];

              [...under3, ...over3].forEach((item) => {
                if (item.KATEGORI === "IN PROCESS") {
                  totalInProcess++;
                  const status = (item.STATUS || "").toUpperCase();
                  if (actionCounts[status] !== undefined)
                    actionCounts[status]++;
                }
              });
            }
          }

          return {
            ...poItem,
            ["LANJUT"]: actionCounts["LANJUT"],
            ["CANCEL"]: actionCounts["CANCEL"],
            ["BUKAN ORDER REG"]: actionCounts["BUKAN ORDER REG"],
            ["TOTAL"]: totalInProcess,
          };
        });

        setEnrichedData(processedData);
      } catch (err) {
        console.error("🚨 Fetch Error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleActionUpdate = async () => {
    setLoading(true);
    try {
      const [poRes, reportRes] = await Promise.all([
        fetch(`${API_URL}/regional_3/sheets/po`),
        fetch(`${API_URL}/regional_3/report`),
      ]);
      if (!poRes.ok || !reportRes.ok)
        throw new Error("❌ One of the API calls failed");

      const poJson = await poRes.json();
      const reportJson = await reportRes.json();

      setPoData(poJson.data);
      setReportData(reportJson.data);

      const processedData = poJson.data.map((poItem) => {
        const witel = poItem.BILL_WITEL;
        const reportEntry = reportJson.data.find((r) => r.witelName === witel);

        let totalInProcess = 0;
        const actionCounts = { LANJUT: 0, CANCEL: 0, "BUKAN ORDER REG": 0 };

        if (reportEntry) {
          for (const [subType, subObj] of Object.entries(reportEntry)) {
            if (subType === "witelName") continue;

            const under3 = subObj["<3blnItems"] || [];
            const over3 = subObj[">3blnItems"] || [];

            [...under3, ...over3].forEach((item) => {
              if (item.KATEGORI === "IN PROCESS") {
                totalInProcess++;
                const status = (item.STATUS || "").toUpperCase();
                if (actionCounts[status] !== undefined) actionCounts[status]++;
              }
            });
          }
        }

        return {
          ...poItem,
          TOTAL_IN_PROCESS: totalInProcess,
          LANJUT: actionCounts.LANJUT,
          CANCEL: actionCounts.CANCEL,
          "BUKAN ORDER REG": actionCounts["BUKAN ORDER REG"],
        };
      });

      setEnrichedData(processedData);
    } catch (err) {
      console.error("🚨 Fetch Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="action-container">
      <div className="action-table-container">
        <div className="title-container">
          <div className="filter-container">
            {selectedWitel == null ? (
              <>
                <p>Select witel:</p>
                <Dropdown
                  options={witelOptions}
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedWitel(null);
                  }}
                />
              </>
            ) : (
              <button onClick={() => setSelectedWitel(null)}>
                <p>← View full table</p>
              </button>
            )}
          </div>
        </div>

        <div
          className="table-wrapper"
          style={{ minHeight: loading || error ? "300px" : "fit-content" }}
        >
          {!selectedWitel && (
            <ActionTable
              actionTabledata={{
                data:
                  selectedCategory === "ALL"
                    ? enrichedData
                    : enrichedData.filter(
                        (row) => row.WITEL === selectedCategory
                      ),
              }}
              onRowClick={(witelName) => setSelectedWitel(witelName)}
              loading={loading}
              error={error}
            />
          )}

          {selectedWitel && (
            <ActionSelectedTable
              reportData={reportData}
              selectedWitel={selectedWitel}
              API_URL={API_URL}
              userEmail={userEmail}
              onUpdateSuccess={handleActionUpdate}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
