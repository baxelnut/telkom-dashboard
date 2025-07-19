// Style
import "./OverallHealthIndexPage.css";

const REGIONS = [
  "BALI",
  "JATIM BARAT", // "MALANG",
  "NUSA TENGGARA",
  "JATIM TIMUR", // "SIDOARJO",
  "SURAMADU",
];
const HOURS = Array.from({ length: 16 }, (_, i) => `${i * 3}:00`);

export default function OverallHealthIndexPage({ API_URL }) {
  const handleHeatCellClick = (region, hour) => {
    console.log(`Clicked cell: ${region} at ${hour}`);
  };

  return (
    <div className="health-index-page">
      <div className="card heatmap">
        <h6>Traffic Load per Region (Today)</h6>
        <div className="heatmap-grid">
          {REGIONS.map((region, rowIdx) =>
            HOURS.map((hour, colIdx) => {
              const level = ((rowIdx + colIdx) % 5) + 1; // fake pattern
              return (
                <div
                  key={`${region}-${hour}`}
                  className={`heatmap-cell level-${level}`}
                  title={`${region} @ ${hour}: Load ${level * 20}%`}
                  onClick={() => handleHeatCellClick(region, hour)}
                >
                  {level * 20}%
                </div>
              );
            })
          )}
        </div>
        <div className="heatmap-legend">
          <span className="level-1">Low</span>
          <span className="level-2">Fair</span>
          <span className="level-3">Moderate</span>
          <span className="level-4">High</span>
          <span className="level-5">Critical</span>
        </div>
      </div>

      <div className="kpi-cards-container">
        <div className="card kpi">
          <h6>Service Uptime</h6>
          <p>91.987%</p>
        </div>

        <div className="card kpi">
          <h6>Pending Provisioning</h6>
          <p>18 items</p>
        </div>

        <div className="card kpi">
          <h6>Avg. Provisioning Time</h6>
          <p>3.4 days</p>
        </div>

        <div className="card kpi">
          <h6>Avg. Resolved</h6>
          <p>2h 15m</p>
        </div>
      </div>
    </div>
  );
}
