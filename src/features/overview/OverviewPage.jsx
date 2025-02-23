import React, { useState } from "react";
import Header from "../../components/Header";
import "./OverViewPage.css";

export default function OverviewPage() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  return (
    <>
      <Header title="Overview" onExpandChange={setIsHeaderExpanded} />
      <div className={`overview ${isHeaderExpanded ? "expanded" : ""}`}>
        <div className="content">
          <h2>Overview Page</h2>
        </div>
      </div>
    </>
  );
}
