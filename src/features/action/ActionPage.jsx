import React, { useState, useEffect } from "react";
import "./ActionPage.css";
import Dropdown from "../../components/utils/Dropdown";
import ActionTable from "./ActionTable";
import ActionSelectedTable from "./ActionSelectedTable";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ActionPage({ API_URL, userEmail }) {
  const [poData, setPoData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [enrichedData, setEnrichedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedWitel, setSelectedWitel] = useState([null, null, null]);
  const [witelOptions, setWitelOptions] = useState([
    { value: "ALL", label: "ALL" },
  ]);
  const [selectedExport, setSelectedExport] = useState("Excel");

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

        const uniqueW = Array.from(
          new Set(poJson.data.map((r) => r.WITEL).filter(Boolean))
        );
        setWitelOptions([
          { value: "ALL", label: "ALL" },
          ...uniqueW.map((w) => ({ value: w, label: w })),
        ]);

        const processed = poJson.data.map((poItem) => {
          const entry =
            reportJson.data.find((r) => r.witelName === poItem.BILL_WITEL)?.[
              "IN PROCESS"
            ] || {};

          const under3 = (entry["<3blnItems"] || []).map((i) => ({
            ...i,
            _bucket: "<",
          }));
          const over3 = (entry[">3blnItems"] || []).map((i) => ({
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
  }, []);

  const refresh = () => {
    setSelectedWitel([null, null, null]);
    window.location.reload();
  };

  const getExportOptions = () =>
    ["Excel", "CSV"].map((v) => ({ value: v, label: v }));

  const handleExport = async () => {
    const type = selectedExport;

    const [bill, wName] = selectedWitel;
    const dataToExport = (
      bill ? enrichedData.filter((r) => r.BILL_WITEL === bill) : enrichedData
    ).map((row) => ({
      PO_EMAIL: Array.isArray(row.PO_EMAIL)
        ? row.PO_EMAIL.join(", ")
        : row.PO_EMAIL,
      PO_NAME: Array.isArray(row.PO_NAME)
        ? row.PO_NAME.join(", ")
        : row.PO_NAME,
      WITEL: row.WITEL,
      BILL_WITEL: row.BILL_WITEL,
      items: row.items.map((it) => ({
        bucket: it._bucket === "<" ? "<3bln" : ">3bln",
        STATUS: it.STATUS,
        ...it,
      })),
    }));

    const flattenedData = dataToExport.flatMap((row) =>
      row.items.map((it) => ({
        PO_EMAIL: row.PO_EMAIL,
        PO_NAME: row.PO_NAME,
        WITEL: row.WITEL,
        BILL_WITEL: row.BILL_WITEL,
        bucket: it.bucket,
        STATUS: it.STATUS,
        ...it,
      }))
    );

    if (!flattenedData.length) {
      alert("No data to export");
      return;
    }

    const sheet = XLSX.utils.json_to_sheet(flattenedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Export");
    if (type === "Excel") {
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `Action Export.xlsx`
      );
    } else {
      const csv = XLSX.utils.sheet_to_csv(sheet);
      saveAs(
        new Blob([csv], { type: "text/csv;charset=utf-8;" }),
        `Action Export.csv`
      );
    }
  };

  return (
    <div className="action-container">
      <div className="action-table-container">
        <div className="filter-container">
          {!selectedWitel[0] ? (
            <div className="select-witel">
              <p>Select Witel:</p>
              <Dropdown
                options={witelOptions}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
            </div>
          ) : (
            <div className="category-filter">
              <button
                className="view-full"
                onClick={() => setSelectedWitel([null, null])}
              >
                <p>← View full table</p>
              </button>

              <div className="filter-container">
                <button className="label" onClick={handleExport}>
                  <p>Export as</p>
                </button>
                <Dropdown
                  options={getExportOptions()}
                  value={selectedExport}
                  onChange={(e) => setSelectedExport(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {selectedWitel[1] && (
          <div className="title-container">
            <h5>
              {selectedWitel[1]} → {selectedWitel[2]}
            </h5>
          </div>
        )}

        <div
          className="table-wrapper"
          style={{ minHeight: loading ? "300px" : "fit-content" }}
        >
          {!selectedWitel[0] ? (
            <ActionTable
              actionTabledata={{
                data:
                  selectedCategory === "ALL"
                    ? enrichedData
                    : enrichedData.filter((r) => r.WITEL === selectedCategory),
              }}
              loading={loading}
              error={error}
              selectedWitel={selectedWitel}
              onRowClick={(billWitel, witelName, poName) => {
                setSelectedWitel([billWitel, witelName, poName]);
              }}
            />
          ) : (
            <ActionSelectedTable
              reportData={reportData
                .filter((entry) => entry.witelName === selectedWitel[0])
                .map((entry) => {
                  const inProc = entry["IN PROCESS"] || {};
                  const allItems = [
                    ...(inProc["<3blnItems"] || []),
                    ...(inProc[">3blnItems"] || []),
                  ];
                  const itemsForPoi = allItems.filter(
                    (item) => item.PIC === selectedWitel[2]
                  );
                  return {
                    ...entry,
                    items: itemsForPoi,
                  };
                })}
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
