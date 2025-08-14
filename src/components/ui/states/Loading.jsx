// Style
import "./Loading.css";

export default function Loading({ label = "Please wait...", backgroundColor }) {
  return (
    <div
      className="loading-container"
      style={{ backgroundColor: `${backgroundColor}` }}
    >
      <div className="spinner"></div>
      <p>{label}</p>
    </div>
  );
}
