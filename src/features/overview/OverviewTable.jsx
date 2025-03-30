import React, { useEffect, useState } from "react";
import "./OverviewTable.css";
import ReactPaginate from "react-paginate";
import Loading from "../../components/Loading";
import Error from "../../components/Error";
import Dropdown from "../../components/utils/Dropdown";

const rowPerPageOptions = [10, 20, 50, 100, 200].map((value) => ({
  value,
  label: `Show ${value} rows`,
}));

export default function OverviewTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0);

  const API_URL = import.meta.env.VITE_DEV_API;

  const fetchData = async (page, limit) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/aosodomoro?page=${page}&limit=${limit}`
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      setData(result.data);
      setTotalRows(result.total);

      console.log(
        `📊 Fetched ${result.data.length} rows (Page ${page} of ${Math.ceil(
          result.total / limit
        )})`
      );
    } catch (error) {
      console.error("🚨 API Fetch Error:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage + 1, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  const pageCount = Math.ceil(totalRows / rowsPerPage);

  return (
    <div className="overview-table">
      <div className="overview-table-title">
        <h5>
          Data Overview
          <p className="debug-info">{`( Total rows: ${totalRows
            .toLocaleString("id-ID")
            .replace(",", ".")} )`}</p>
        </h5>

        <Dropdown
          options={rowPerPageOptions}
          value={rowsPerPage}
          onChange={(e) => setRowPerPage(Number(e.target.value))}
        />
      </div>

      <div className="table-wrapper">
        {loading ? (
          <Loading />
        ) : error ? (
          <Error message={error} />
        ) : data.length === 0 ? (
          <p>No data available.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  {Object.keys(data[0] || {}).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>
                        <p className="overview-table-items">{value || "-"}</p>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.length > 0 && (
        <ReactPaginate
          previousLabel={"← Previous"}
          nextLabel={"Next →"}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={2}
          onPageChange={(event) => setCurrentPage(event.selected)}
          containerClassName={"pagination"}
          activeClassName={"active"}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
          previousClassName={"page-item"}
          previousLinkClassName={"page-link"}
          nextClassName={"page-item"}
          nextLinkClassName={"page-link"}
          breakClassName={"page-item"}
          breakLinkClassName={"page-link"}
        />
      )}
    </div>
  );
}
