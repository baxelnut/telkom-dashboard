// Style
import "./CompletionRatioPage.css";

export default function CompletionRatioPage({ API_URL }) {
  return (
    <div className="completion-ratio-page">
      <h6>Completion Ratio</h6>
      <p>{API_URL}</p>
    </div>
  );
}
