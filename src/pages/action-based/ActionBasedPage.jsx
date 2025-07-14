import { Helmet } from "react-helmet-async";
// Style
import "./ActionBasedPage.css";
// Components

export default function ActionBasedPage({ API_URL }) {
  return (
    <div className="action-based-page">
      <Helmet>
        <title>Action-Based Insights | Telkom</title>
        <meta
          name="description"
          content="Interactive insights based on user or system actions. Useful for auditing and behavior tracking."
        />
      </Helmet>

      <div className="card action table"></div>
    </div>
  );
}
