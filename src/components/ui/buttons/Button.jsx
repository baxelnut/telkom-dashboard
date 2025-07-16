import { Link } from "react-router-dom";
// Syle
import "./Button.css";
// Components
import Icon from "../icons/Icon";
// Data
import { SVG_PATHS } from "../../../data/utilData";

export default function Button({
  text = null,
  arrowRight = false,
  arrowLeft = false,
  hollow = false,
  fullWidth = false,
  rounded = false,
  short = false,
  iconPath = null,
  iconSize = 16,
  iconAfter = false,
  viewBox = "0 0 16 16",
  onClick = null,
  href = null,
  to = null,
  textColor = null,
  backgroundColor = null,
  hoverBackgroundColor = null,
  hoverTextColor = null,
  hoverBorderColor = null,
  disabled = false,
}) {
  const hasCustomHover =
    hoverBackgroundColor || hoverTextColor || hoverBorderColor;

  const isIconOnly = iconPath && !text;

  const classes = [
    hollow ? "hollow" : "btn",
    fullWidth ? "full" : "",
    rounded ? "rounded-pill" : "rounded-soft",
    short ? "short" : "",
    isIconOnly ? "only-icon" : "",
    hasCustomHover ? "custom-hover no-gradient" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    "--btn-bg": backgroundColor || "var(--primary-variant)",
    "--btn-color": textColor,
    "--btn-hover-bg": hoverBackgroundColor || "var(--bg)",
    "--btn-hover-color": hoverTextColor || "white",
    "--btn-hover-border": hoverBorderColor || "var(--neutral)",
  };

  const arrowPath = arrowRight
    ? SVG_PATHS.arrowRight
    : arrowLeft
    ? SVG_PATHS.arrowLeft
    : null;

  const iconComponent = iconPath ? (
    <Icon
      path={iconPath}
      width={iconSize}
      height={iconSize}
      fill={textColor || "var(--btn-color)"}
      viewBox={viewBox}
    />
  ) : arrowPath ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill={textColor || "var(--bg)"}
      viewBox="0 0 16 16"
      width={iconSize}
      height={iconSize}
    >
      <path d={arrowPath} />
    </svg>
  ) : null;

  const content = (
    <>
      {!iconAfter && iconComponent}
      {!isIconOnly && <h6 className="small-h">{text?.trim() || "Button"}</h6>}
      {iconAfter && iconComponent}
    </>
  );

  const sharedProps = {
    className: classes,
    style,
    onClick,
    disabled,
  };

  if (to)
    return (
      <Link to={to} {...sharedProps}>
        {content}
      </Link>
    );
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...sharedProps}>
        {content}
      </a>
    );

  return <button {...sharedProps}>{content}</button>;
}
