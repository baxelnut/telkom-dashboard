import React, { useState } from "react";
import "./OverViewPage.css";
import Header from "../../components/Header";
import OverViewCard from "./OverViewCard";
import PerformanceOverTime from "./PerformanceOverTime";
import PerformanceBySession from "./PerformanceBySession";
import GraphCard from "./GraphCard";
import OverviewTable from "./OverviewTable";
import BarChartComponent from "../../components/graphs/BarChartComponent";
import PieChartComponent from "../../components/graphs/PieChartComponent";
import RadarChartComponent from "../../components/graphs/RadarChartComponent";

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
      percentage: 10.86,
      percentageSubtitle: "Compared to yesterday",
    },
  ];

  const overTimeData = [
    { title: "Total Revenue", amount: "XXX", percentage: 55 },
    { title: "Total Target", amount: "XXX", percentage: 45 },
  ];

  const sampleData = [
    { name: "Jan", value: 40 },
    { name: "Feb", value: 55 },
    { name: "Mar", value: 70 },
    { name: "Apr", value: 30 },
  ];

  const graphData = [
    {
      title: "Segmen",
      component: (
        <RadarChartComponent filePath="/data/dummy.xlsx" columnName="SEGMEN" />
      ),
    },
    {
      title: "Bill Witel",
      component: (
        <PieChartComponent
          filePath="/data/dummy.xlsx"
          columnName="BILL_WITEL"
        />
      ),
    },
    {
      title: "Sub-segmen",
      component: (
        <BarChartComponent
          filePath="/data/dummy.xlsx"
          columnName="SUB_SEGMEN"
        />
      ),
    },
  ];
  return (
    <>
      <Header title="Overview" onExpandChange={setIsHeaderExpanded} />
      <div className={`overview ${isHeaderExpanded ? "expanded" : ""}`}>
        <div className="content">
          <div className="p-overview-container">
            {performanceData.map((item, index) => (
              <OverViewCard key={index} {...item} />
            ))}
          </div>
          <div className="p-over-time-container">
            <PerformanceOverTime data={overTimeData} />
            <PerformanceBySession
              filePath="/data/dummy.xlsx"
              columnName="ORDER_SUBTYPE"
            />
          </div>
          <div className="p-graphs-container">
            {graphData.map((graph, index) => (
              <GraphCard
                key={index}
                title={graph.title}
                graphComponent={graph.component}
              />
            ))}
          </div>
          <OverviewTable />
        </div>
      </div>
    </>
  );
}
