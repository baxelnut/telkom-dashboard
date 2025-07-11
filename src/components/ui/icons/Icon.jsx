import "./Icon.css";
import PropTypes from "prop-types";

export default function Icon({
  path,
  width = 16,
  height = 16,
  fill = "var(--text)",
  className = "",
  viewBox = "0 0 16 16",
}) {
  return (
    <svg
      className={`app-icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill={fill}
      viewBox={viewBox}
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
  ]).isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fill: PropTypes.string,
  className: PropTypes.string,
  viewBox: PropTypes.string,
};
