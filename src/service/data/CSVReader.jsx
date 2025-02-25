import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function CSVReader({ filePath }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();

        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        setData(jsonData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading file:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [filePath]);

  return (
    <div>
      <h3>Excel Data Preview</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <pre>{JSON.stringify(data.slice(0, 5), null, 2)}</pre>
      )}
    </div>
  );
}
