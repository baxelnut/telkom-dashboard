// Style
import "./SessionBySubType.css";
// Components
import CardContent from "../../components/ui/cards/CardContent";
// Custom hook
import useFetchData from "../../hooks/useFetchData";

// Helpers
const KEYS = ["ao", "so", "do", "mo", "ro"];

export default function SessionBySubType({ API_URL }) {
  const { data, loading, error } = useFetchData(
    `${API_URL}/regional-3/sheets/order-subtype2`
  );

  const aggregateData = () => {
    return data.reduce((aggregated, customer) => {
      KEYS.forEach((key) => {
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

  const displayData = KEYS.map((key) => ({
    abbreviationName: key,
    sessions: aggregatedData[key],
    percentage: ((aggregatedData[key] / total) * 100).toFixed(2),
  }));

  return (
    <div className="card session-by-sub-type">
      <h6>Session by Sub-type</h6>
      <p>Showing data for order sub-type (AOSODOMORO).</p>

      <CardContent
        loading={loading}
        error={error}
        children={displayData.map((item, index) => (
          <div className="bar-horizontal-chart" key={index}>
            <div className="bar-text">
              <h6 className="small-h" style={{ flex: 1 }}>
                {KEYS.includes(item.abbreviationName.toLowerCase())
                  ? item.abbreviationName.toUpperCase()
                  : item.abbreviationName
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
              </h6>
              <p>{item.sessions}</p>
              <h6 className="small-h">{item.percentage}%</h6>
            </div>
            <div className="bar">
              <div
                className="bar active"
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      />
    </div>
  );
}
