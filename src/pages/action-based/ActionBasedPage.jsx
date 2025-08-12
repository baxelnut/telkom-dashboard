import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
// Styles
import "./ActionBasedPage.css";
// Components
import ActionTable from "../../features/action/ActionTable";
import ActionTableHeader from "./ActionTableHeader";
import ActionSelectedTable from "../../features/action/ActionSelectedTable";
import CardsContent from "../../components/ui/cards/CardContent";
import OverviewByWitel from "../../features/overview/OverviewByWitel";
// Context
import { useAuth } from "../../context/AuthContext";
// Custom Hooks
import useMultiFetchData from "../../hooks/useMultiFetchData";
import useWitelOptions from "../../hooks/useWitelOptions";
import useEnrichedData from "../../hooks/useEnrichedData";
import useFilteredReport from "../../hooks/useFilteredReport";
// Helpers
import {
  normalizeFilters,
  areFiltersActive,
  filterRows,
  filterItems,
  flattenForExport,
  makeFilename,
  exportData,
} from "../../helpers/exportHelpers";

export default function ActionBasedPage({ API_URL }) {
  const { user, isAdmin } = useAuth();
  const { data, loading, error, refetch } = useMultiFetchData({
    po: `${API_URL}/regional-3/sheets/po`,
    report: `${API_URL}/regional-3/report`,
  });
  const [selected, setSelected] = useState({
    witel: "ALL",
    detailed: [null, null, null, null], // [witel, po, period, status]
    exportType: "Excel",
  });
  const [witel, po, period, status] = selected.detailed;
  const witelOptions = useWitelOptions(data);
  const enrichedData = useEnrichedData(data);
  const filteredReport = useFilteredReport(data, selected.detailed);
  const debounceTimer = useRef(null);

  const handleViewFull = async () => {
    setSelected((prev) => ({ ...prev, detailed: [null, null, null, null] }));
    await refetch();
  };

  const handleRowClick = (w, p, prd, stat) => {
    setSelected((prev) => ({ ...prev, detailed: [w, p, prd, stat] }));
  };

  const handleExport = () => {
    const filters = normalizeFilters(selected.detailed);
    const activeFilters = areFiltersActive(filters);
    const filteredRows = filterRows(enrichedData, filters, activeFilters);
    const rows = filterItems(filteredRows, filters, activeFilters);
    const flat = flattenForExport(rows);
    if (!flat.length) {
      alert("No data found for the selected filters.");
      return;
    }
    const finalName = makeFilename(filters, activeFilters);
    exportData(selected.exportType, flat, finalName);
  };

  const debounceRefresh = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      window.location.reload();
    }, 60000);
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

      <OverviewByWitel API_URL={API_URL} />

      {!witel ? (
        // 2 ActionTables (one for each bucket)
        ["<", ">"].map((bucketKey) => (
          <div
            key={bucketKey}
            className="card action table"
            style={{ minHeight: loading ? "350px" : "fit-content" }}
          >
            <ActionTableHeader
              witel={witel}
              witelOptions={witelOptions}
              selected={selected}
              setSelected={setSelected}
              handleViewFull={handleViewFull}
              handleExport={handleExport}
              po={po}
              status={status}
              period={period}
              bucketLabel={bucketKey === "<" ? "<3 BLN" : ">3 BLN"}
            />
            <CardsContent loading={loading} error={error}>
              <div className="table-wrapper">
                <ActionTable
                  bucket={bucketKey}
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
              </div>
            </CardsContent>
          </div>
        ))
      ) : (
        // 1 ActionSelectedTable
        <div
          className="card action table"
          style={{ minHeight: loading ? "350px" : "fit-content" }}
        >
          <ActionTableHeader
            witel={witel}
            witelOptions={witelOptions}
            selected={selected}
            setSelected={setSelected}
            handleViewFull={handleViewFull}
            handleExport={handleExport}
            po={po}
            status={status}
            period={period}
            bucketLabel="Selected Witel"
          />
          <CardsContent loading={loading} error={error}>
            <div className="table-wrapper">
              <ActionSelectedTable
                API_URL={API_URL}
                reportData={filteredReport}
                userEmail={user?.email}
                onUpdateSuccess={debounceRefresh}
                isAdmin={isAdmin}
              />
            </div>
          </CardsContent>
        </div>
      )}
    </div>
  );
}
