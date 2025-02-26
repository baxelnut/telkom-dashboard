import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./ReportTable.css";
import Loading from "../../components/Loading";

export default function ReportTable({ filePath }) {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const groupedCounts = processData(jsonData);
        setCounts(groupedCounts);
      } catch (error) {
        console.error("Error loading file:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filePath]);

  const processData = (data) => {
    return data.reduce((acc, row) => {
      const witel = row["SERVICE_WITEL"];
      const kategoriUmur = row["KATEGORI_UMUR"];

      if (!acc[witel]) acc[witel] = { "<3 bulan": 0, ">3 bulan": 0 };
      if (kategoriUmur === "<3 bulan") acc[witel]["<3 bulan"]++;
      if (kategoriUmur === ">3 bulan") acc[witel][">3 bulan"]++;

      return acc;
    }, {});
  };

  const tableHeaders = ["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].map(
    (label, index) => (
      <th key={index}>
        {label}
        <br /> REV (JT)
      </th>
    )
  );

  return (
    <div className="report-table-wrapper">
      {loading ? (
        <Loading />
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th rowSpan="2">WITEL</th>
                <th colSpan="3">&lt;3 BLN</th>
                <th rowSpan="2">&lt;3 BLN <br/> Total</th>
                <th colSpan="3">&gt;3 BLN</th>
                <th rowSpan="2">&gt;3 BLN <br/> Total</th>
                <th rowSpan="2">Grand <br/> Total</th>
              </tr>
              <tr>{[...tableHeaders, ...tableHeaders]}</tr>
            </thead>
            <tbody>
              {Object.entries(counts).map(([witel, data], index) => {
                const total3Bln = data["<3 bulan"];
                const totalMore3Bln = data[">3 bulan"];
                const grandTotal = total3Bln + totalMore3Bln;

                return (
                  <tr key={index}>
                    <td>{witel}</td>
                    <td>{total3Bln}</td>
                    <td>200</td>
                    <td>30</td>
                    <td>{total3Bln}</td>
                    <td>350</td>
                    <td>150</td>
                    <td>350</td>
                    <td>{totalMore3Bln}</td>
                    <td>{grandTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
