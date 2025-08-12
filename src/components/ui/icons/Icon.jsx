import PropTypes from "prop-types";
// Style
import "./Icon.css";

export default function Icon({
  className = "",
  path,
  size = 16,
  fill = "var(--text)",
  viewBox = "0 0 16 16",
  onClick = null,
  style = {},
}) {
  return (
    <svg
      className={`app-icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={fill}
      viewBox={viewBox}
      onClick={onClick}
      style={style}
    >
      {typeof path === "string" ? (
        <path d={path} />
      ) : Array.isArray(path) ? (
        path.map((d, i) => <path key={i} d={d} />)
      ) : (
        path
      )}
    </svg>
  );
}

Icon.propTypes = {
  path: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.node,
  ]),
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fill: PropTypes.string,
  className: PropTypes.string,
  viewBox: PropTypes.string,
};
