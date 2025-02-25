import React from "react";
import "./PerformancePage.css";
import PerformanceWidget from "./PerformanceWidget";
import BarChartComparisonChart from "../../components/graphs/BarChartComparisonChart";

const widgetData = [
  {
    icon: "src/assets/icons/grid-fill.svg",
    title: "Lorem Ipsum 1",
    value: "249",
    percentage: 10.86,
    description: "Lorem ipsum",
  },
  {
    icon: "src/assets/icons/grid-fill.svg",
    title: "Lorem Ipsum 2",
    value: "349",
    percentage: -5.12,
    description: "Dolor sit amet",
  },
  {
    icon: "src/assets/icons/grid-fill.svg",
    title: "Lorem Ipsum 3",
    value: "189",
    percentage: 2.45,
    description: "Consectetur adipiscing",
  },
];

const barChartData = {
  title: "Revenue Comparison",
  bars: [
    { percentage: 40, value: 123 },
    { percentage: 70, value: 456 },
    { percentage: 30, value: 789 },
    { percentage: 70, value: 1087 },
    { percentage: 90, value: 1467 },
  ],
};

export default function PerformancePage() {
  return (
    <div className="performance">
      <div className="content">
        <div className="p1-container">
          {widgetData.map((item, index) => (
            <React.Fragment key={index}>
              <PerformanceWidget {...item} />
              {index < widgetData.length - 1 && <div className="divider"></div>}
            </React.Fragment>
          ))}
        </div>
        <div className="p2-container">
          <div className="p2-left">
            <BarChartComparisonChart data={barChartData} />
          </div>
          <div className="p2-right">
            <BarChartComparisonChart data={barChartData} />
          </div>
        </div>
      </div>
    </div>
  );
}
