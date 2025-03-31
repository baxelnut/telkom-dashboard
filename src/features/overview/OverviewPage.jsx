import React, { useEffect, useState } from "react";
import "./OverviewPage.css";
import OverViewStatus from "./OverViewStatus";
import OverViewOverTime from "./OverViewOverTime";
import OverViewSession from "./OverViewSession";
import OverviewTable from "./OverviewTable";
import OverViewRadar from "./OverViewRadar";
import OverViewPie from "./OverViewPie";
import OverViewBar from "./OverViewBar";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

const API_URL = import.meta.env.VITE_DEV_API;

const overviewOvertimeInfo = [
  { title: "Total Revenue", amount: "XXX", percentage: 55 },
  { title: "Total Target", amount: "XXX", percentage: 45 },
];

const overviewBar = { content: "<i show bar content here??>" };
const overviewPie = { content: "<i show pie content here??>" };
const overviewRadar = { content: "<i show radar content here??>" };

export default function OverviewPage() {
  const [statusData, setStatusData] = useState([]);
  const [sessionData, setSessionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilteredData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [statusResponse, sessionResponse] = await Promise.all([
          fetch(`${API_URL}/aosodomoro/reg_3_status`),
          fetch(`${API_URL}/aosodomoro/reg_3_subtypes`),
        ]);

        if (!statusResponse.ok) throw new Error("Failed to fetch status data");
        if (!sessionResponse.ok)
          throw new Error("Failed to fetch session data");

        const statusResult = await statusResponse.json();
        const sessionResult = await sessionResponse.json();

        setStatusData(statusResult.data);
        setSessionData(sessionResult.data);
      } catch (err) {
        console.error("🚨 Error Fetching Filtered Data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredData();
  }, []);

  return (
    <div className="overview-container">
      <div className="status-chart-container">
        {loading || error
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="status-placeholder">
                {loading ? (
                  <Loading backgroundColor="transparent" />
                ) : (
                  <Error />
                )}
              </div>
            ))
          : statusData.map((item, index) => (
              <OverViewStatus
                key={index}
                overviewStatus={item}
                loading={loading}
                error={error}
              />
            ))}
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
          overviewSession={sessionData}
          loading={loading}
          error={error}
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

      <div className="overview-table-container">
        <OverviewTable title="Data Overview" />
      </div>
    </div>
  );
}
