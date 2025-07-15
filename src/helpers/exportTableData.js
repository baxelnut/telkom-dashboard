import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportData = async (type, data, filename = "Data Preview") => {
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
    saveAs(blob, `${filename}.xlsx`);
  } else if (type === "CSV") {
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${filename}.csv`);
  }

  console.log(`Exported as ${type}`);
};

export const getExportOptions = () =>
  ["Excel", "CSV"].map((val) => ({
    value: val,
    label: val,
  }));
