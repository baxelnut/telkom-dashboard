import { Helmet } from "react-helmet-async";
// Style
import "./AosodomoroReportPage.css";
// Components

export default function AosodomoroReportPage({ API_URL }) {
  return (
    <div className="report-page aosodomoro">
      <Helmet>
        <title>AOSODOMORO Report | Telkom</title>
        <meta
          name="description"
          content="Analytical report for AOSODOMORO initiatives, containing key performance indicators and strategic insights."
        />
      </Helmet>

      <div className="card aosodomoro filter"></div>

      <div className="card aosodomoro table">
        <h6>Report for ...</h6>
      </div>
    </div>
  );
}
