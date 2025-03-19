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

  const [rawData, setRawData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [sessionData, setSessionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const witelMapping = {
    MALANG: "JATIM TIMUR",
    SIDOARJO: "JATIM BARAT",
  };

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      try {
        // fetch processed data for OverViewCard
        const processResponse = await fetch(
          "http://localhost:5000/api/processed_data"
        );
        const processData = await processResponse.json();
        const renamedData = processData.map((witel) => ({
          ...witel,
          witelName: witelMapping[witel.witelName] || witel.witelName,
        }));
        setProcessedData(renamedData);

        // fetch sessions data for PerformaceBySession
        const sessionResponse = await fetch(
          `http://localhost:5000/api/performance?columnName=ORDER_SUBTYPE`
        );
        const sessionData = await sessionResponse.json();
        setSessionData(sessionData);

        // fetch all data
        const rawResponse = await fetch("http://localhost:5000/api/all-data");
        const rawData = await rawResponse.json();
        setRawData(rawData);

        // make loading spinner go bye bte
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(true);
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // const formatChartData = (item) => {
  //   const categories = [
  //     "PROVIDE ORDER",
  //     "IN PROCESS",
  //     "PROV. COMPLETE",
  //     "READY TO BILL",
  //   ];

  //   const categoryColors = {
  //     "PROVIDE ORDER": "#d72323",
  //     "IN PROCESS": "#e76705",
  //     "PROV. COMPLETE": "#5cb338",
  //     "READY TO BILL": "#312a68",
  //     Unknown: "#999999",
  //   };

  //   return categories.map((category) => ({
  //     name: category,
  //     value: item[category] || 0,
  //     fill: categoryColors[category] || "#999999",
  //   }));
  // };

  if (error)
    return (
      <div className="overview-loading">
        <ErrorWarning e={error} />
      </div>
    );

  // const performanceData = top5Witel.map((witel) => ({
  //   witelName: witel,
  //   percentage: (Math.random() * (Math.random() < 0.5 ? -1 : 1)).toFixed(2),
  //   percentageSubtitle: "Compared to yesterday",
  // }));

  // temporary
  const overTimeData = [
    { title: "Total Revenue", amount: "XXX", percentage: 55 },
    { title: "Total Target", amount: "XXX", percentage: 45 },
  ];

  const graphData = [
    {
      title: "Segmen",
      component: <RadarChartComponent fileData={rawData} columnName="SEGMEN" />,
      data: rawData.map((witel) => ({
        witelName: witel,
      })),
    },
    {
      title: "Bill Witel",
      component: (
        <PieChartComponent fileData={rawData} columnName="BILL_WITEL" />
      ),
    },
    {
      title: "Sub-segmen",
      component: (
        <BarChartComponent fileData={rawData} columnName="SUB_SEGMEN" />
      ),
    },
  ];

  // const processData = (data) => {
  //   const result = {};

  //   data.forEach(({ BILL_WITEL, KATEGORI }) => {
  //     if (!result[BILL_WITEL]) {
  //       result[BILL_WITEL] = {
  //         witelName: BILL_WITEL,
  //         provideOrder: 0,
  //         inProcess: 0,
  //         provComplete: 0,
  //         readyToBill: 0,
  //         billComplete: 0,
  //       };
  //     }

  //     switch (KATEGORI) {
  //       case "PROVIDE ORDER":
  //         result[BILL_WITEL].provideOrder += 1;
  //         break;
  //       case "IN PROCESS":
  //         result[BILL_WITEL].inProcess += 1;
  //         break;
  //       case "PROV. COMPLETE":
  //         result[BILL_WITEL].provComplete += 1;
  //         break;
  //       case "READY TO BILL":
  //         result[BILL_WITEL].readyToBill += 1;
  //         break;
  //       case "BILLING COMPLETED":
  //         result[BILL_WITEL].billComplete += 1;
  //         break;
  //       default:
  //         break;
  //     }
  //   });

  //   return Object.values(result);
  // };
  // const chartData = processData(data);

  return (
    <>
      <div className={`overview ${isHeaderExpanded ? "expanded" : ""}`}>
        <div className="content">
          {/* <pre>{JSON.stringify(processedData, null, 2)}</pre> */}
          <div className="p-overview-container">
            {loading ? (
              <div className="overview-card-placeholder">
                <Loading />
              </div>
            ) : (
              <>
                {processedData.map((witel) => {
                  const total =
                    witel.provideOrder +
                    witel.inProcess +
                    witel.provComplete +
                    witel.readyToBill +
                    witel.billComplete;

                  const pieData = [
                    {
                      name: "Provide Order",
                      value: witel.provideOrder,
                      percentage: ((witel.provideOrder / total) * 100).toFixed(
                        2
                      ),
                    },
                    {
                      name: "In Process",
                      value: witel.inProcess,
                      percentage: ((witel.inProcess / total) * 100).toFixed(2),
                    },
                    {
                      name: "Prov. Complete",
                      value: witel.provComplete,
                      percentage: ((witel.provComplete / total) * 100).toFixed(
                        2
                      ),
                    },
                    {
                      name: "Ready to Bill",
                      value: witel.readyToBill,
                      percentage: ((witel.readyToBill / total) * 100).toFixed(
                        2
                      ),
                    },
                    {
                      name: "Billing Completed",
                      value: witel.billComplete,
                      percentage: ((witel.billComplete / total) * 100).toFixed(
                        2
                      ),
                    },
                  ];

                  return (
                    <OverViewCard
                      key={witel.witelName}
                      data={pieData}
                      title={witel.witelName}
                    />
                  );
                })}
              </>
            )}
          </div>
          {/* <pre>{JSON.stringify(sessionData, null, 2)}</pre> */}
          <div className="p-over-time-container">
            <PerformanceOverTime data={overTimeData} />
            <PerformanceBySession
              data={sessionData}
              title="Session by Sub-type"
              subtitle="Showing data for top order sub-type"
              loading={loading}
              error={error}
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
          <OverviewTable data={rawData} loading={loading} error={error} />
        </div>
      </div>
    </>
  );
}
