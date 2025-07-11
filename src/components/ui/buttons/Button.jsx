import { Link } from "react-router-dom";
// Syle
import "./Button.css";
// Data
import { SVG_PATHS } from "../../../data/utilData";

export default function Button({
  text = "Button",
  arrow = false,
  hollow = false,
  fullWidth = false,
  rounded = false,
  onClick = null,
  href = null,
  to = null,
  textColor = null,
  short = false,
}) {
  const classes = [
    hollow ? "hollow" : "btn",
    fullWidth ? "full" : "",
    rounded ? "rounded-pill" : "rounded-soft",
    short ? "short" : "",
  ].join(" ");

  const content = (
    <>
      <p style={textColor ? { color: textColor } : {}}>{text}</p>
      {arrow && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={textColor || "currentColor"}
          viewBox="0 0 16 16"
        >
          <path d={SVG_PATHS.arrowRight} />
        </svg>
      )}
    </>
  );

  if (to)
    return (
      <Link className={classes} to={to}>
        {content}
      </Link>
    );
  if (href)
    return (
      <a
        className={classes}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  return (
    <button className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
