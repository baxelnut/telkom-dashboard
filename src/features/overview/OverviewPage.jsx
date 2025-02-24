import React, { useState } from "react";
import Header from "../../components/Header";
import "./OverViewPage.css";
import PerformanceCard from "../../components/cards/PerformanceCard";
import PerformanceOverTime from "../../components/cards/PerformanceOverTime";

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

  const overTimeData = [
    { title: "Total Revenue", amount: "XXX", percentage: 55 },
    { title: "Total Target", amount: "XXX", percentage: 45 },
  ];

  return (
    <>
      <Header title="Overview" onExpandChange={setIsHeaderExpanded} />
      <div className={`overview ${isHeaderExpanded ? "expanded" : ""}`}>
        <div className="content">
          <div className="p-overview-container">
            {performanceData.map((item, index) => (
              <PerformanceCard key={index} {...item} />
            ))}
          </div>
          <div className="p-over-time-container">
            <PerformanceOverTime data={overTimeData} />
          </div>
        </div>
      </div>
    </>
  );
}
