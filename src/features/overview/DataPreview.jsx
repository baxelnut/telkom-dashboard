import { useState } from "react";
// Style
import "./DataPreview.css";
// Components
import Button from "../../components/ui/buttons/Button";
import CardContent from "../../components/ui/cards/CardContent";
import Dropdown from "../../components/ui/input/Dropdown";
import CustomPagination from "../../components/ui/tables/CustomPagination";
import TableScroll from "../../components/ui/tables/TableScroll";
// Custom hook & context
import useFetchData from "../../hooks/useFetchData";
import { useAuth } from "../../context/AuthContext";
// Helpers
import { exportData, getExportOptions } from "../../helpers/exportHelpers";
import { rowPerPageOptions } from "../../helpers/overviewUtils";
import { hiddenCols } from "../../helpers/tableHelper";

export default function DataPreview({ API_URL }) {
  const { isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedExport, setSelectedExport] = useState("Excel");

  const { data, loading, error, raw } = useFetchData(
    `${API_URL}/aosodomoro/sheets?page=${currentPage + 1}&limit=${rowsPerPage}`
  );

  const totalRows = raw?.totalProcessedData || 0;
  const pageCount = Math.ceil(totalRows / rowsPerPage);

  // Remove columns if not admin
  const visibleData = !isAdmin
    ? data?.map((row) =>
        Object.fromEntries(
          Object.entries(row).filter(([key]) => !hiddenCols.includes(key))
        )
      )
    : data;

  const handleExport = () => {
    exportData(selectedExport, visibleData, "Data Preview");
  };

  return (
    <div className="card data-preview">
      <div className="head-container">
        <div className="title-container">
          <div className="title">
            <h6>Data Preview</h6>
            <p className="small-p">
              {`(Total rows: ${totalRows.toLocaleString("id-ID")})`}
            </p>
          </div>
          <Dropdown
            options={rowPerPageOptions}
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            short
            chevronDown
          />
        </div>
        <div className="export-button-container">
          <Button text="Export as" onClick={handleExport} short />
          <Dropdown
            options={getExportOptions()}
            value={selectedExport}
            onChange={(e) => setSelectedExport(e.target.value)}
            short
            chevronDown
          />
        </div>
      </div>
      <CardContent
        loading={loading}
        error={error}
        children={
          visibleData && visibleData.length > 0 ? (
            <div className="table-wrapper">
              <TableScroll
                data={visibleData}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
              />
            </div>
          ) : null
        }
      />
      {visibleData && visibleData.length > 0 && (
        <CustomPagination
          pageCount={pageCount}
          onPageChange={(selected) => setCurrentPage(selected)}
        />
      )}
    </div>
  );
}
