import React, { useEffect, useState } from "react";
import "./OverviewPage.css";
import OverViewStatus from "./OverViewStatus";
import OverViewRevenue from "./OverViewRevenue";
import OverViewSession from "./OverViewSession";
import OverviewTable from "./OverviewTable";
import OverViewRadar from "./OverViewRadar";
import OverViewPie from "./OverViewPie";
import OverViewBar from "./OverViewBar";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

export default function OverviewPage({ API_URL }) {
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
          fetch(`${API_URL}/regional_3/progress_status`),
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
                  <Error message={error} />
                )}
              </div>
            ))
          : statusData.map((item, index) => (
              <OverViewStatus key={index} overviewStatus={item} />
            ))}
      </div>

      <div className="session-chart-container">
        <OverViewRevenue
          title="Revenue by Order Sub-type"
          subtitle="Showing data for revenue by order sub-type per witel in"
          API_URL={API_URL}
        />

        <OverViewBar
          title="Segmen Bar Chart"
          subtitle="Showing data for segmen in"
          API_URL={API_URL}
        />
      </div>

      <div className="analysis-container">
        <div>
          <OverViewSession
            title="Session by Sub-type"
            subtitle="Showing data for top order sub-type."
            overviewSession={sessionData}
            loading={loading}
            error={error}
          />
        </div>

        <div>
          <OverViewRadar
            title="Segmen Radar Chart"
            subtitle="Showing data for segmen in"
            API_URL={API_URL}
          />
          <OverViewPie
            title="Category Pie Chart"
            subtitle="Showing data for category per witel"
            API_URL={API_URL}
          />
        </div>
      </div>

      <div className="overview-table-container">
        <OverviewTable title="Data Overview" API_URL={API_URL} />
      </div>
    </div>
  );
}
