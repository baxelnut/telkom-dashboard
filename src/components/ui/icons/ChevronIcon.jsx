// Style
import "./ChevronIcon.css";
// Data
import { SVG_PATHS } from "../../../data/utilData";

const directionMap = {
  up: "chevronUp",
  down: "chevronDown",
  left: "chevronLeft",
  right: "chevronRight",
};

export default function ChevronIcon({
  direction = "right",
  width = 12,
  height = 12,
  fill = "var(--neutral)",
  className = "",
}) {
  const pathKey = directionMap[direction] || "chevronRight";
  const d = SVG_PATHS[pathKey];

  if (!d) {
    console.error(`ChevronIcon: Invalid direction "${direction}"`);
    return null;
  }

  return (
    <svg
      className={`chevron-icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill={fill}
      viewBox="0 0 16 16"
    >
      <path fillRule="evenodd" d={d} />
    </svg>
  );
}
