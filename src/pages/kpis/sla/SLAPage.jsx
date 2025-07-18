// Style
import "./SLAPage.css";

export default function SLAPage({ API_URL }) {
  return (
    <div className="sla-page">
      <h6>SLA</h6>
      <p>{API_URL}</p>
    </div>
  );
}
