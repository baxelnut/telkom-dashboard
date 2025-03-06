import React, { useState } from "react";
import "./OverviewTable.css";
import ReactPaginate from "react-paginate";
import Loading from "../../components/Loading";

export default function OverviewTable({ data, loading, error }) {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 100;

  const pageCount = Math.ceil(data.length / rowsPerPage);
  const displayedData = data.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  return (
    <div className="table-container">
      <h5>Data Overview</h5>
      <div className="table-wrapper">
        {error ? (
          <p>Error: {error}</p>
        ) : loading ? (
          <Loading />
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
                {displayedData.map((row, index) => (
                  <tr key={index}>
                    <td>{currentPage * rowsPerPage + index + 1}</td>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
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
