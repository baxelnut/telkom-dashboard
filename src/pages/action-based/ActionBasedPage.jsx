import { Helmet } from "react-helmet-async";
import { useRef, useState, useMemo } from "react";
// Styles
import "./ActionBasedPage.css";
// Components
import ActionTable from "../../features/action/ActionTable";
import ActionSelectedTable from "../../features/action/ActionSelectedTable";
import Button from "../../components/ui/buttons/Button";
import CardsContent from "../../components/ui/cards/CardContent";
import Dropdown from "../../components/ui/input/Dropdown";
// Context & Hooks
import { useAuth } from "../../context/AuthContext";
import useMultiFetchData from "../../hooks/useMultiFetchData";
// Helpers
import { getExportOptions, exportData } from "../../helpers/exportTableData";

export default function ActionBasedPage({ API_URL }) {
  const { data, loading, error, refetch } = useMultiFetchData({
    po: `${API_URL}/regional-3/sheets/po`,
    report: `${API_URL}/regional-3/report`,
  });
  const [selected, setSelected] = useState({
    witel: "ALL",
    detailed: [null, null, null, null], // [witel, po, period, status]
    exportType: "Excel",
  });
  const { user } = useAuth();
  const debounceTimer = useRef(null);
  const [witel, po, period, status] = selected.detailed;

  const witelOptions = useMemo(() => {
    if (!data?.po) return [];
    const unique = [...new Set(data.po.map((r) => r.WITEL).filter(Boolean))];
    return [
      { value: "ALL", label: "ALL" },
      ...unique.map((w) => ({ value: w, label: w })),
    ];
  }, [data]);

  const enrichedData = useMemo(() => {
    if (!data?.po || !data?.report) return [];
    return data.po.map((po) => {
      const report = data.report.find((r) => r.witelName === po.WITEL);
      const inProc = report?.["IN PROCESS"] || {};

      const items = [
        ...(inProc["<3blnItems"] || []).map((i) => ({ ...i, _bucket: "<" })),
        ...(inProc[">3blnItems"] || []).map((i) => ({ ...i, _bucket: ">" })),
      ];
      const count = { Lanjut: 0, Cancel: 0, "Bukan Order Reg": 0 };
      items.forEach(({ STATUS, KATEGORI }) => {
        if (KATEGORI !== "IN PROCESS") return;
        const key =
          {
            lanjut: "Lanjut",
            cancel: "Cancel",
            "bukan order reg": "Bukan Order Reg",
          }[(STATUS || "").trim().toLowerCase()] || "No Status";
        if (count[key] !== undefined) count[key]++;
      });
      return {
        ...po,
        items,
        ...count,
        Total: count.Lanjut + count.Cancel + count["Bukan Order Reg"],
      };
    });
  }, [data]);

  const filteredReport = useMemo(() => {
    if (!data?.report) return [];
    return data.report
      .filter((r) => witel === "ALL" || r.witelName === witel)
      .map((r) => {
        let items = [];
        const inProc = r["IN PROCESS"] || {};
        if (period === "<3") items = inProc["<3blnItems"] || [];
        else if (period === ">3") items = inProc[">3blnItems"] || [];
        else
          items = [
            ...(inProc["<3blnItems"] || []),
            ...(inProc[">3blnItems"] || []),
          ];
        if (po && po !== "ALL PO") items = items.filter((i) => i.PIC === po);
        if (status && status !== "ALL STATUS") {
          items = items.filter((i) =>
            status === "No Status"
              ? !i.STATUS || i.STATUS.trim() === ""
              : i.STATUS?.trim() === status
          );
        }
        return items.length ? { witelName: r.witelName, items } : null;
      })
      .filter(Boolean);
  }, [data, selected.detailed]);

  const handleRowClick = (w, p, prd, stat) => {
    setSelected((prev) => ({ ...prev, detailed: [w, p, prd, stat] }));
  };

  const handleViewFull = async () => {
    setSelected((prev) => ({ ...prev, detailed: [null, null, null, null] }));
    await refetch();
  };

  const debounceRefresh = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      window.location.reload();
    }, 60000);
  };

  const handleExport = () => {
    const [selectedWitel] = selected.detailed;
    const rows = (
      selectedWitel === "ALL"
        ? enrichedData
        : enrichedData.filter((r) => r.WITEL === selectedWitel)
    ).map((r) => ({
      PO_EMAIL: Array.isArray(r.PO_EMAIL) ? r.PO_EMAIL.join(", ") : r.PO_EMAIL,
      PO_NAME: Array.isArray(r.PO_NAME) ? r.PO_NAME.join(", ") : r.PO_NAME,
      WITEL: r.WITEL,
      items: r.items.map((i) => ({
        bucket: i._bucket === "<" ? "<3bln" : ">3bln",
        STATUS: i.STATUS,
        ...i,
      })),
    }));
    const flat = rows.flatMap((r) =>
      r.items.map((i) => ({
        PO_EMAIL: r.PO_EMAIL,
        PO_NAME: r.PO_NAME,
        WITEL: r.WITEL,
        bucket: i.bucket,
        STATUS: i.STATUS,
        ...i,
      }))
    );
    exportData(selected.exportType, flat, "Action Export");
  };

  return (
    <div className="action-based-page">
      <Helmet>
        <title>Action-Based Insights | Telkom</title>
        <meta
          name="description"
          content="Interactive insights based on user or system actions. Useful for auditing and behavior tracking."
        />
      </Helmet>

      <div
        className="card action table"
        style={{ minHeight: loading ? "350px" : "fit-content" }}
      >
        {!witel ? (
          <div className="filter-container">
            <div className="filter-items">
              <p>Select witel:</p>
              <Dropdown
                options={witelOptions}
                value={selected.witel}
                onChange={(e) =>
                  setSelected((prev) => ({
                    ...prev,
                    witel: e.target.value,
                  }))
                }
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
              <Button text="Export as" onClick={handleExport} short />
              <Dropdown
                options={getExportOptions()}
                value={selected.exportType}
                onChange={(e) =>
                  setSelected((prev) => ({
                    ...prev,
                    exportType: e.target.value,
                  }))
                }
                short
                chevronDown
              />
            </div>
          </div>
        )}

        {po && (
          <div className="title">
            <h6>
              {po} → {status} →{" "}
              {period === "ALL PERIOD" ? period : `${period} bulan`}
            </h6>
          </div>
        )}

        <CardsContent
          loading={loading}
          error={error}
          children={
            <div className="table-wrapper">
              {!witel ? (
                <ActionTable
                  data={{
                    data:
                      selected.witel === "ALL"
                        ? enrichedData
                        : enrichedData.filter(
                            (r) => r.WITEL === selected.witel
                          ),
                  }}
                  onRowClick={handleRowClick}
                />
              ) : (
                <ActionSelectedTable
                  reportData={filteredReport}
                  selectedWitel={selected.detailed}
                  API_URL={API_URL}
                  userEmail={user?.email}
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
