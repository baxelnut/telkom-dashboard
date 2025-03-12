import React from "react";
import "./ReportTableDetails.css";

export default function ReportTableDetails({ title, data }) {
  return (
    <div className="report-details">
      <h5>{title}</h5>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
