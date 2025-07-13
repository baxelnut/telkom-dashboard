// Style
import "./Error.css";
// Components
import Icon from "../icons/Icon";
// Data
import { SVG_PATHS } from "../../../data/utilData";

export default function Error({ message, className = "error-container" }) {
  const displayMessage = message?.trim() ? message : "Something went wrong!";

  return (
    <div className={className}>
      <div className="error-icon">
        <Icon path={SVG_PATHS.error} />
      </div>
      <p className="error-message">{displayMessage}</p>
    </div>
  );
}
