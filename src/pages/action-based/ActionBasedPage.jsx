import { Helmet } from "react-helmet-async";
import { useRef, useState, useEffect } from "react";
// Style
import "./ActionBasedPage.css";
// Components
import ActionTable from "../../features/action/ActionTable";
import ActionSelectedTable from "../../features/action/ActionSelectedTable";
import Button from "../../components/ui/buttons/Button";
import CardsContent from "../../components/ui/cards/CardContent";
import Dropdown from "../../components/ui/input/Dropdown";
// Context
import { useAuth } from "../../context/AuthContext";
// Custom hook
import useMultiFetchData from "../../hooks/useMultiFetchData";
// Helpers
import { getExportOptions } from "../../helpers/exportTableData";

export default function ActionBasedPage({ API_URL }) {
  const { user } = useAuth();
  const userEmail = user?.email;

  const { data, loading, error, refetch } = useMultiFetchData({
    po: `${API_URL}/regional-3/sheets/po`,
    report: `${API_URL}/regional-3/report`,
  });
  const debounceTimer = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [enrichedData, setEnrichedData] = useState([]);
  const [selectedExport, setSelectedExport] = useState("Excel");
  const [witelOptions, setWitelOptions] = useState([
    { value: "ALL", label: "ALL" },
  ]);
  const [selectedWitel, setSelectedWitel] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);

  const handleViewFull = async () => {
    setSelectedWitel([null, null, null, null, null]);
    console.log("Refetching...");
    await refetch(); // re-triggers all API calls
  };

  const debounceRefresh = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSelectedWitel([null, null, null]);
      window.location.reload();
    }, 60000); // do nothing for 60s and get fetched
  };

  const [selectedWitelName, selectedPoName, period, status] = selectedWitel;
  const filteredReportData = (data.report || [])
    .filter((entry) => {
      if (selectedWitelName === "ALL") return true;
      return entry.witelName === selectedWitelName;
    })
    .map((entry) => {
      const inProc = entry["IN PROCESS"] || {};
      let items =
        period === "<3"
          ? inProc["<3blnItems"] || []
          : period === ">3"
          ? inProc[">3blnItems"] || []
          : [...(inProc["<3blnItems"] || []), ...(inProc[">3blnItems"] || [])];

      if (selectedPoName && selectedPoName !== "ALL PO") {
        items = items.filter((it) => it.PIC === selectedPoName);
      }

      if (status && status !== "ALL STATUS") {
        if (status === "No Status") {
          items = items.filter(
            (it) => !it.STATUS || it.STATUS.toString().trim() === ""
          );
        } else {
          items = items.filter((it) => (it.STATUS || "").trim() === status);
        }
      }

      if (items.length === 0) return null;
      return {
        witelName: entry.witelName,
        items,
      };
    })
    .filter((e) => e);

  useEffect(() => {
    if (!data?.po || !data?.report) return;

    const uniqueWitels = [
      ...new Set(data.po.map((r) => r.WITEL).filter(Boolean)),
    ];
    setWitelOptions([
      { value: "ALL", label: "ALL" },
      ...uniqueWitels.map((w) => ({ value: w, label: w })),
    ]);

    const merged = data.po.map((po) => {
      const report = data.report.find((r) => r.witelName === po.WITEL);
      const inProc = report?.["IN PROCESS"] || {};

      const under3 = (inProc["<3blnItems"] || []).map((i) => ({
        ...i,
        _bucket: "<",
      }));
      const over3 = (inProc[">3blnItems"] || []).map((i) => ({
        ...i,
        _bucket: ">",
      }));

      const items = [...under3, ...over3];
      const count = { Lanjut: 0, Cancel: 0, "Bukan Order Reg": 0 };

      items.forEach((it) => {
        if (it.KATEGORI !== "IN PROCESS") return;
        const key =
          {
            lanjut: "Lanjut",
            cancel: "Cancel",
            "bukan order reg": "Bukan Order Reg",
          }[(it.STATUS || "").trim().toLowerCase()] || "No Status";

        if (count[key] !== undefined) count[key]++;
      });

      return {
        ...po,
        items,
        ...count,
        Total: count.Lanjut + count.Cancel + count["Bukan Order Reg"],
      };
    });

    setEnrichedData(merged);
  }, [data]);

  const handleExport = async () => {
    const type = selectedExport;

    const [bill, wName] = selectedWitel;
    const dataToExport = (
      bill ? enrichedData.filter((r) => r.WITEL === bill) : enrichedData
    ).map((row) => ({
      PO_EMAIL: Array.isArray(row.PO_EMAIL)
        ? row.PO_EMAIL.join(", ")
        : row.PO_EMAIL,
      PO_NAME: Array.isArray(row.PO_NAME)
        ? row.PO_NAME.join(", ")
        : row.PO_NAME,
      WITEL: row.WITEL,
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

  console.log("selectedWitel:", selectedWitel);
  return (
    <div className="action-based-page">
      <Helmet>
        <title>Action-Based Insights | Telkom</title>
        <meta
          name="description"
          content="Interactive insights based on user or system actions. Useful for auditing and behavior tracking."
        />
      </Helmet>

      <div className="card action table">
        {!selectedWitel[0] ? (
          <div className="filter-container">
            <div className="filter-items">
              <p>Select witel:</p>
              <Dropdown
                options={witelOptions}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                short
                chevronDown
              />
            </div>
          </div>
        ) : (
          <div className="filter-container back-btn">
            <div className="filter-items">
              <Button
                text="View full table"
                onClick={handleViewFull}
                arrowLeft
                short
              />
            </div>
            <div className="filter-items">
              <Button
                text="Export as"
                onClick={() => handleExport(selectedExport)}
                short
              />
              <Dropdown
                options={getExportOptions()}
                value={selectedExport}
                onChange={(e) => setSelectedExport(e.target.value)}
                short
                chevronDown
              />
            </div>
          </div>
        )}

        {selectedWitel[1] && (
          <div className="title">
            <h6>
              {selectedWitel[1]} → {selectedWitel[3]} →{" "}
              {selectedWitel[2] === "ALL PERIOD"
                ? selectedWitel[2]
                : `${selectedWitel[2]} bulan`}
            </h6>
          </div>
        )}

        <CardsContent
          loading={loading}
          error={error}
          children={
            <div className="table-wrapper">
              {!selectedWitel[0] ? (
                <ActionTable
                  actionTabledata={{
                    data:
                      selectedCategory === "ALL"
                        ? enrichedData
                        : enrichedData.filter(
                            (r) => r.WITEL === selectedCategory
                          ),
                  }}
                  onRowClick={(witelName, poName, period, status) => {
                    setSelectedWitel([witelName, poName, period, status]);
                  }}
                />
              ) : (
                <ActionSelectedTable
                  reportData={filteredReportData}
                  selectedWitel={selectedWitel}
                  API_URL={API_URL}
                  userEmail={userEmail}
                  onUpdateSuccess={debounceRefresh}
                />
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}
