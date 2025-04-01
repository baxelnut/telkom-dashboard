import React from "react";
import "./OverViewSession.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

export default function OverViewSession({
  title,
  subtitle,
  overviewSession,
  loading,
  error,
}) {
  const keys = [
    "disconnect",
    "suspend",
    "renewal_agreement",
    "modify",
    "resume",
    "modify_price",
    "modify_ba",
    "modify_termin",
  ];

  const aggregateData = () => {
    return overviewSession.reduce((aggregated, customer) => {
      keys.forEach((key) => {
        aggregated[key] = (aggregated[key] || 0) + (customer[key] || 0);
      });
      return aggregated;
    }, {});
  };

  const aggregatedData = aggregateData();
  const total = Object.values(aggregatedData).reduce(
    (sum, value) => sum + value,
    0
  );

  const displayData = keys.map((key) => ({
    displayName: key,
    sessions: aggregatedData[key],
    percentage: ((aggregatedData[key] / total) * 100).toFixed(2),
  }));

  return (
    <div className="session-container">
      <div className="session-title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>

      <div className="session-content">
        {loading || error ? (
          loading ? (
            <Loading />
          ) : (
            <Error message={error} />
          )
        ) : (
          displayData.map((display, index) => (
            <div className="widget" key={index}>
              <div className="head">
                <h6 className="title">
                  {/* Convert snake_case to Capitalize Each Word */}
                  {display.displayName
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </h6>
                <p>{display.sessions}</p>
                <h6>• {display.percentage}%</h6>
              </div>
              <div className="session-bar-graph">
                <div
                  className="session-bar-active"
                  style={{ width: `${display.percentage}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
