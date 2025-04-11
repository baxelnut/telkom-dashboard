import React, { useEffect, useState } from "react";
import "./PerformancePage.css";
import PerformanceStatus from "./PerformanceStatus";
import PerformanceSummarize from "./PerformanceSummarize";
import PerformanceTable from "./PerformanceTable";
import PerformanceLargeVisualize from "./PerformanceLargeVisualize";
import PerformanceVisualizeCards from "./PerformanceVisualizeCards";
import PerformanceVGraphContent from "./PerformanceVGraphContent";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

export default function PerformancePage({ API_URL }) {
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

        const rawData = statusResult.data;

        const totals = rawData.reduce(
          (acc, curr) => {
            acc.lanjut += curr.lanjut || 0;
            acc.cancel += curr.cancel || 0;
            acc.bukan_order_reg += curr.bukan_order_reg || 0;
            acc.no_status += curr.no_status || 0;
            return acc;
          },
          { lanjut: 0, cancel: 0, bukan_order_reg: 0, no_status: 0 }
        );

        const statusDataFormatted = [
          {
            icon: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z",
            title: "Lanjut",
            value: totals.lanjut,
            color: "rgb(var(--text-rgb), 1)",
            backgroundColor: "rgb(var(--success-rgb), 1)",
          },
          {
            icon: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z",
            title: "Cancel",
            value: totals.cancel,
            color: "rgb(var(--text-rgb), 1)",
            backgroundColor: "rgb(var(--error-rgb), 1)",
          },
          {
            icon: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z",
            title: "Bukan Order Reg",
            value: totals.bukan_order_reg,
            color: "rgb(var(--text-rgb), 1)",
            backgroundColor: "rgb(255, 255, 0, 0.7)",
          },
          {
            icon: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z",
            title: "No status",
            value: totals.no_status,
            color: "rgb(var(--text-rgb), 1)",
            backgroundColor: "rgb(var(--text-variant-rgb), 0.5)",
          },
        ];

        setStatusData(statusDataFormatted);
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
    <div className="performance-container">
      <div className="status-container">
        {loading || error
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="status-placeholder">
                {loading ? (
                  <Loading backgroundColor="transparent" />
                ) : (
                  <Error message={error} />
                )}
              </div>
            ))
          : statusData.map((item, index) => (
              <PerformanceStatus
                key={index}
                icon={item.icon}
                title={item.title}
                value={item.value}
                backgroundColor={item.backgroundColor}
                color={item.color}
              />
            ))}
      </div>

      <div className="summarize-container">
        <PerformanceSummarize statusData={statusData} />
      </div>

      <div className="visualize-container">
        <PerformanceVisualizeCards statusData={statusData} />

        <PerformanceVGraphContent />
      </div>

      <div className="large-visualize-container">
        <PerformanceLargeVisualize statusData={statusData} />
      </div>

      <div className="performance-table-container">
        <PerformanceTable />
      </div>
    </div>
  );
}
