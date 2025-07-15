import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// Style
import "./DataPreview.css";
// Components
import Button from "../../components/ui/buttons/Button";
import CardContent from "../../components/ui/cards/CardContent";
import Dropdown from "../../components/ui/input/Dropdown";
import CustomPagination from "../../components/ui/tables/CustomPagination";
import TableScroll from "../../components/ui/tables/TableScroll";
// Custom hook
import useFetchData from "../../hooks/useFetchData";

// Helpers
const rowPerPageOptions = [10, 20, 50, 100, 200, 500].map((val) => ({
  value: val,
  label: `Show ${val} rows`,
}));
const exportOptions = ["Excel", "CSV"].map((val) => ({
  value: val,
  label: val,
}));

export default function DataPreview({ API_URL }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedExport, setSelectedExport] = useState("Excel");

  const { data, loading, error, raw } = useFetchData(
    `${API_URL}/aosodomoro/sheets?page=${currentPage + 1}&limit=${rowsPerPage}`
  );

  const totalRows = raw?.totalProcessedData || 0;
  const pageCount = Math.ceil(totalRows / rowsPerPage);

  const handleExport = async (type) => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    if (type === "Excel") {
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Data Preview.xlsx");
    } else if (type === "CSV") {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "DataPreview.csv");
    }
    console.log(`Exported as ${type}`);
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
          <Button
            text="Export as"
            onClick={() => handleExport(selectedExport)}
            short
          />
          <Dropdown
            options={exportOptions}
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
          data && data.length > 0 ? (
            <div className="table-wrapper">
              <TableScroll
                data={data}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
              />
            </div>
          ) : null
        }
      />
      {data && data.length > 0 && (
        <CustomPagination
          pageCount={pageCount}
          onPageChange={(selected) => setCurrentPage(selected)}
        />
      )}
    </div>
  );
}
