import { Helmet } from "react-helmet-async";
// Style
import "./OverviewPage.css";
// Cards
import AmmountBySubType from "../../features/overview/AmmountBySubType";
import CategoryByWitel from "../../features/overview/CategoryByWitel";
import DataPreview from "../../features/overview/DataPreview";
import OverviewByWitel from "../../features/overview/OverviewByWitel";
import RevBySubType from "../../features/overview/RevBySubType";
import SessionBySubType from "../../features/overview/SessionBySubType";
import SegmenRadar from "../../features/overview/SegmenRadar";

export default function OverviewPage({ API_URL }) {
  return (
    <div className="overview-page">
      <Helmet>
        <title>Dashboard Overview | Telkom</title>
        <meta
          name="description"
          content="High-level overview of system performance, KPIs, and operational summaries across departments."
        />
      </Helmet>

      <OverviewByWitel API_URL={API_URL} />
      <div className="cards-container-row-1-1">
        <RevBySubType API_URL={API_URL} />
        <AmmountBySubType API_URL={API_URL} />
      </div>
      <div className="cards-container-row">
        <SessionBySubType API_URL={API_URL} />
        <div className="card segmen-radar-chart">
          <SegmenRadar API_URL={API_URL} />
          <CategoryByWitel API_URL={API_URL} />
        </div>
      </div>
      <DataPreview API_URL={API_URL} />
    </div>
  );
}
