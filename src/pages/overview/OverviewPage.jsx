// Style
import "./OverviewPage.css";
// Components

export default function OverviewPage() {
  return (
    <div className="overview-page">
      <div className="cards-container-grid">
        <div className="card">
          <h6>Overview Cards</h6>
        </div>
        <div className="card">
          <h6>Overview Cards</h6>
        </div>
        <div className="card">
          <h6>Overview Cards</h6>
        </div>
        <div className="card">
          <h6>Overview Cards</h6>
        </div>
        <div className="card">
          <h6>Overview Cards</h6>
        </div>
      </div>

      <div className="cards-container-row-1-1">
        <div className="card rev-by-order-sub-type">
          <h6>Revenue by Order Sub-type</h6>
        </div>
        <div className="card ammount-by-order-sub-type">
          <h6>Amount by Order Sub-type</h6>
        </div>
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
