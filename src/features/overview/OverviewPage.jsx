import React, { useState, useEffect } from "react";
import "./OverViewPage.css";
import Header from "../../components/Header";
import OverViewCard from "../../components/graphs/OverViewCard";
import PerformanceOverTime from "./PerformanceOverTime";
import PerformanceBySession from "./PerformanceBySession";
import GraphCard from "./GraphCard";
import OverviewTable from "./OverviewTable";
import BarChartComponent from "../../components/graphs/BarChartComponent";
import PieChartComponent from "../../components/graphs/PieChartComponent";
import RadarChartComponent from "../../components/graphs/RadarChartComponent";
import { readFile } from "../../service/data/readExcel";

export default function OverviewPage() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [top4Witel, setTop4Witel] = useState([]);

  useEffect(() => {
    async function fetchWitel() {
      const fileData = await readFile("/data/dummy.xlsx");
      if (!fileData) return;

      const allowedWitels = [
        "BALI",
        "MALANG",
        "NUSA TENGGARA",
        "SIDOARJO",
        "SURAMADU",
      ];
      const witelCounts = fileData.reduce((acc, row) => {
        const witel = row["BILL_WITEL"] || "Unknown";
        if (allowedWitels.includes(witel)) {
          acc[witel] = (acc[witel] || 0) + 1;
        }
        return acc;
      }, {});

      const sortedWitel = Object.entries(witelCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => name);

      console.log("Filtered Witel:", sortedWitel);
      setTop4Witel(sortedWitel);
    }

    fetchWitel();
  }, []);

  const performanceData = top4Witel.map((witel) => ({
    witelName: witel,
    percentage: (Math.random() * (Math.random() < 0.5 ? -1 : 1)).toFixed(2),
    percentageSubtitle: "Compared to yesterday",
    filePath: "/data/dummy.xlsx",
  }));

  const overTimeData = [
    { title: "Total Revenue", amount: "XXX", percentage: 55 },
    { title: "Total Target", amount: "XXX", percentage: 45 },
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
              title="Session by Sub-type"
              subtitle="Showing data for top order sub-type"
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
