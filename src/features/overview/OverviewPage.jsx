import React, { useState, useEffect } from "react";
import "./OverViewPage.css";
import OverViewCard from "../../components/graphs/OverViewCard";
import PerformanceOverTime from "./PerformanceOverTime";
import PerformanceBySession from "./PerformanceBySession";
import GraphCard from "./GraphCard";
import OverviewTable from "./OverviewTable";
import BarChartComponent from "../../components/graphs/BarChartComponent";
import PieChartComponent from "../../components/graphs/PieChartComponent";
import RadarChartComponent from "../../components/graphs/RadarChartComponent";
import Loading from "../../components/Loading";
import ErrorWarning from "../../components/ErrorWarning";

export default function OverviewPage() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [top5Witel, setTop5Witel] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/data");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        console.log("Fetched Data:", data);
        setFileData(data);

        const witelCounts = data.reduce((acc, item) => {
          if (item.BILL_WITEL) {
            acc[item.BILL_WITEL] = (acc[item.BILL_WITEL] || 0) + 1;
          }
          return acc;
        }, {});

        const sortedWitel = Object.entries(witelCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([witel]) => witel);

        setTop5Witel(sortedWitel);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="overview-loading">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="overview-loading">
        <ErrorWarning e={error} />
      </div>
    );

  const performanceData = top5Witel.map((witel) => ({
    witelName: witel,
    percentage: (Math.random() * (Math.random() < 0.5 ? -1 : 1)).toFixed(2),
    percentageSubtitle: "Compared to yesterday",
  }));

  const overTimeData = [
    { title: "Total Revenue", amount: "XXX", percentage: 55 },
    { title: "Total Target", amount: "XXX", percentage: 45 },
  ];

  const graphData = [
    {
      title: "Segmen",
      component: (
        <RadarChartComponent fileData={fileData} columnName="SEGMEN" />
      ),
    },
    {
      title: "Bill Witel",
      component: (
        <PieChartComponent fileData={fileData} columnName="BILL_WITEL" />
      ),
    },
    {
      title: "Sub-segmen",
      component: (
        <BarChartComponent fileData={fileData} columnName="SUB_SEGMEN" />
      ),
    },
  ];
  return (
    <>
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
