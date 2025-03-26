import React from "react";
import "./OverviewPage.css";
import OverViewStatus from "./OverViewStatus";
import OverViewOverTime from "./OverViewOverTime";
import OverViewSession from "./OverViewSession";
import OverviewTable from "./OverviewTable";
import OverViewRadar from "./OverViewRadar";
import OverViewPie from "./OverViewPie";
import OverViewBar from "./OverViewBar";

const overviewStatus = [
  {
    title: "graph1",
    content: "<i show content?>",
    completed: 69.69,
    description: "Compared to yesterday",
  },
  {
    title: "graph2",
    content: "<i show content?>",
    completed: 69.69,
    description: "Compared to yesterday",
  },
  {
    title: "graph3",
    content: "<i show content?>",
    completed: 69.69,
    description: "Compared to yesterday",
  },
  {
    title: "graph4",
    content: "<i show content?>",
    completed: 69.69,
    description: "Compared to yesterday",
  },
  {
    title: "graph5",
    content: "<i show content?>",
    completed: 69.69,
    description: "Compared to yesterday",
  },
];

const overviewSession = [
  { name: "sub-type1", sessions: 120, percentage: 25.5 },
  { name: "sub-type2", sessions: 95, percentage: 13.2 },
  { name: "sub-type3", sessions: 150, percentage: 18.9 },
  { name: "sub-type4", sessions: 80, percentage: 5.7 },
  { name: "sub-type5", sessions: 110, percentage: 2.3 },
];

const overviewOvertimeInfo = [
  { title: "Total Revenue", amount: "XXX", percentage: 55 },
  { title: "Total Target", amount: "XXX", percentage: 45 },
];

const overviewBar = { content: "<i show bar content here??>" };
const overviewPie = { content: "<i show pie content here??>" };
const overviewRadar = { content: "<i show radar content here??>" };

export default function OverviewPage() {
  return (
    <div className="overview-container">
      <div className="status-chart-container">
        {overviewStatus.map((item, index) => {
          return <OverViewStatus key={index} overviewStatus={item} />;
        })}
      </div>

      <div className="session-chart-container">
        <OverViewOverTime
          title="Revenue Over Time"
          subtitle="Showing data for revenue overtime."
          overviewOvertimeInfo={overviewOvertimeInfo}
        />
        <OverViewSession
          title="Session by Sub-type"
          subtitle="Showing data for top order sub-type."
          overviewSession={overviewSession}
        />
      </div>

      <div className="analysis-container">
        <div>
          <OverViewBar
            title="Sub-segmen"
            subtitle="Showing data for ... lorem ipsum."
            overviewBar={overviewBar}
          />
        </div>

        <div>
          <OverViewRadar
            title="Segmen"
            subtitle="Showing data for ... lorem ipsum."
            overviewRadar={overviewRadar}
          />
          <OverViewPie
            title="Bill Witel"
            subtitle="Showing data for ... lorem ipsum."
            overviewPie={overviewPie}
          />
        </div>
      </div>

      <div className="table-container">
        <OverviewTable title="Data Overview" />
      </div>
    </div>
  );
}
