// Style
import "./OverviewPage.css";
// Cards
import AmmountBySubType from "../../features/overview/AmmountBySubType";
import OverviewByWitel from "../../features/overview/OverviewByWitel";
import RevBySubType from "../../features/overview/RevBySubType";

export default function OverviewPage({ API_URL }) {
  return (
    <div className="overview-page">
      <OverviewByWitel API_URL={API_URL} />
      
      <div className="cards-container-row-1-1">
        <RevBySubType API_URL={API_URL} />
        <AmmountBySubType API_URL={API_URL} />
      </div>

      <div className="cards-container-row">
        <div className="card session-by-sub-type">
          <h6>Session by Sub-type</h6>
        </div>
        <div className="card segmen-radar-chart">
          <h6>Segmen Radar Chart</h6>
          <h6>Witel Pie Chart</h6>
        </div>
      </div>

      <div className="card data-overview">
        <h6>Data Overview</h6>
      </div>
    </div>
  );
}
