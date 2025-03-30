import React, { useEffect, useState } from "react";
import "./OverviewTable.css";
import ReactPaginate from "react-paginate";
import Loading from "../../components/Loading";
import Error from "../../components/Error";

export default function OverviewTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const rowsPerPage = 50;
  const API_URL = import.meta.env.VITE_DEV_API;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/aosodomoro`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result);
        console.log(`📊 Total items: ${result.length}`);
      } catch (error) {
        console.error("🚨 API Fetch Error:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pageCount = Math.ceil(data.length / rowsPerPage);
  const displayedData = data.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  return (
    <div className="overview-table">
      <h5>Data Overview</h5>

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
                  <th>
                    <h6>No</h6>
                  </th>
                  {Object.keys(data[0] || {}).map((key) => (
                    <th key={key}>
                      <h6>{key}</h6>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedData.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <p>{currentPage * rowsPerPage + index + 1}</p>
                    </td>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>
                        <p>{value || "-"}</p>
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
