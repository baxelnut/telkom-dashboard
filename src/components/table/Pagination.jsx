import React from "react";
import ReactPaginate from "react-paginate";
import "./Pagination.css";

export default function Pagination({ pageCount, onPageChange }) {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  return (
    <ReactPaginate
      previousLabel={isMobile ? "Previous" : "← Previous"}
      nextLabel={isMobile ? "Next" : "Next →"}
      breakLabel={isMobile ? null : "..."}
      pageCount={pageCount}
      marginPagesDisplayed={1}
      pageRangeDisplayed={isMobile ? 0 : 2}
      onPageChange={(event) => onPageChange(event.selected)}
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
  );
}
