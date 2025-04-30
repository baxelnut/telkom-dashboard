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
        if (!poRes.ok || !reportRes.ok) throw new Error("API failed");

        const poJson = await poRes.json();
        const reportJson = await reportRes.json();

        setPoData(poJson.data);
        setReportData(reportJson.data);

        const uniqueWitels = [
          ...new Set(poJson.data.map((row) => row.WITEL).filter(Boolean)),
        ];
        setWitelOptions([
          { value: "ALL", label: "ALL" },
          ...uniqueWitels.map((w) => ({ value: w, label: w })),
        ]);

        const processed = poJson.data.map((poItem) => {
          const reportEntry =
            reportJson.data.find((r) => r.witelName === poItem.BILL_WITEL)?.[
              "IN PROCESS"
            ] || {};

          const under3 = (reportEntry["<3blnItems"] || []).map((i) => ({
            ...i,
            _bucket: "<",
          }));
          const over3 = (reportEntry[">3blnItems"] || []).map((i) => ({
            ...i,
            _bucket: ">",
          }));
          const items = [...under3, ...over3];

          const counts = { Lanjut: 0, Cancel: 0, "Bukan Order Reg": 0 };
          items.forEach((it) => {
            if (it.KATEGORI === "IN PROCESS") {
              const raw = (it.STATUS || "").trim().toLowerCase();
              const map = {
                lanjut: "Lanjut",
                cancel: "Cancel",
                "bukan order reg": "Bukan Order Reg",
              };
              const norm = map[raw];
              if (norm) counts[norm]++;
            }
          });
          const total =
            counts.Lanjut + counts.Cancel + counts["Bukan Order Reg"];

          return {
            ...poItem,
            items,
            Lanjut: counts.Lanjut,
            Cancel: counts.Cancel,
            "Bukan Order Reg": counts["Bukan Order Reg"],
            Total: total,
          };
        });

        setEnrichedData(processed);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const refresh = () => {
    setSelectedWitel(null);
    setLoading(true);

    window.location.reload();
  };

  return (
    <div className="action-container">
      <div className="action-table-container">
        <div className="filter-container">
          {!selectedWitel ? (
            <>
              <p>Select Witel:</p>
              <Dropdown
                options={witelOptions}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
              />
            </>
          ) : (
            <button onClick={() => setSelectedWitel(null)}>
              <p>← View full table</p>
            </button>
          )}
        </div>

        <div
          className="table-wrapper"
          style={{ minHeight: loading ? "300px" : "fit-content" }}
        >
          {!selectedWitel ? (
            <ActionTable
              actionTabledata={{
                data:
                  selectedCategory === "ALL"
                    ? enrichedData
                    : enrichedData.filter((r) => r.WITEL === selectedCategory),
              }}
              loading={loading}
              error={error}
              onRowClick={(w) => setSelectedWitel(w)}
            />
          ) : (
            <ActionSelectedTable
              reportData={reportData}
              selectedWitel={selectedWitel}
              API_URL={API_URL}
              userEmail={userEmail}
              onUpdateSuccess={refresh}
            />
          )}
        </div>
      </div>
    </div>
  );
}
