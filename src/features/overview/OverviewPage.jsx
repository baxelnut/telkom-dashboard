import React, { useState } from "react";
import Header from "../../components/Header";
import "./OverViewPage.css";
import PerformanceCard from "../../components/cards/PerformanceCard";

export default function OverviewPage() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  const performanceData = [
    {
      title: "Lorem Ipsum",
      amount: "XXXX",
      percentage: 10.86,
      percentageSubtitle: "Compared to yesterday",
    },
    {
      title: "Lorem Ipsum",
      amount: "XXXX",
      percentage: -10.86,
      percentageSubtitle: "Compared to yesterday",
    },
    {
      title: "Lorem Ipsum",
      amount: "XXXX",
      percentage: 0.0,
      percentageSubtitle: "Compared to yesterday",
    },
    {
      title: "Lorem Ipsum",
      amount: "XXXX",
      percentage: +10.86,
      percentageSubtitle: "Compared to yesterday",
    },
  ];

  return (
    <>
      <Header title="Overview" onExpandChange={setIsHeaderExpanded} />
      <div className={`overview ${isHeaderExpanded ? "expanded" : ""}`}>
        <div className="content">
          <div className="performance-overview">
            {performanceData.map((item, index) => (
              <PerformanceCard key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
