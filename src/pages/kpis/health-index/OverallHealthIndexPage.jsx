// Style
import "./OverallHealthIndexPage.css";

export default function OverallHealthIndexPage({ API_URL }) {
  return (
    <div className="health-index-page">
      <h6>Overall Health Index</h6>
      <p>{API_URL}</p>
    </div>
  );
}
