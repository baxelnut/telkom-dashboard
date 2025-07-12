import { Link } from "react-router-dom";
// Syle
import "./Button.css";
// Components
import Icon from "../icons/Icon";
// Data
import { SVG_PATHS } from "../../../data/utilData";

export default function Button({
  text = null,
  arrow = false,
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
    "--btn-bg": backgroundColor,
    "--btn-color": textColor,
    "--btn-hover-bg": hoverBackgroundColor,
    "--btn-hover-color": hoverTextColor,
    "--btn-hover-border": hoverBorderColor,
  };

  const iconComponent = iconPath ? (
    <Icon
      path={iconPath}
      width={iconSize}
      height={iconSize}
      fill={textColor || "var(--btn-color)"}
      viewBox={viewBox}
    />
  ) : arrow ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill={textColor || "currentColor"}
      viewBox="0 0 16 16"
      width={iconSize}
      height={iconSize}
    >
      <path d={SVG_PATHS.arrowRight} />
    </svg>
  ) : null;

  const content = (
    <>
      {!iconAfter && iconComponent}
      {!isIconOnly && (
        <p style={{ color: textColor }}>{text?.trim() || "Button"}</p>
      )}
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
