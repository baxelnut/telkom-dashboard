// Style
import "./Loading.css";

export default function Loading({ backgroundColor }) {
  return (
    <div
      className="loading-container"
      style={{ backgroundColor: `${backgroundColor}` }}
    >
      <div className="spinner"></div>
      <p>Please wait...</p>
    </div>
  );
}
