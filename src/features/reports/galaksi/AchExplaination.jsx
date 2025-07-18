// Style
import "./AchExplaination.css";
// KPI Utils
import { ACH_THRESHOLDS } from "../../kpis/galaksiUtils";

export default function AchExplanation() {
  return (
    <div className="ach-explanation">
      {ACH_THRESHOLDS.map(({ range, value }, idx) => (
        <p key={idx}>
          <strong>{range}</strong> → <em>{value}</em>
        </p>
      ))}
    </div>
  );
}
