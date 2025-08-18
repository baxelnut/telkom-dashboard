// Style
import "./Dropdown.css";
// Components
import Icon from "../icons/Icon";
// Data
import { SVG_PATHS } from "../../../data/utilsData";

export default function Dropdown({
  name,
  options = [],
  value = "",
  onChange = () => {},
  short = false,
  fullWidth = false,
  rounded = false,
  radius = 6,
  trailingIcon = null,
  chevronDown = false,
  disabled = false,
}) {
  const classes = [
    "dropdown",
    short ? "short" : "",
    rounded ? "rounded-pill" : "rounded-soft",
    trailingIcon || chevronDown ? "with-icon" : "",
  ].join(" ");

  const style = {
    borderRadius: rounded ? "360px" : `${radius}px`,
  };

  return (
    <div
      className={`dropdown-wrapper ${fullWidth ? "full" : ""}`}
      style={style}
    >
      <select
        name={name}
        className={classes}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {options.map((option) =>
          option.options ? (
            <optgroup key={option.label} label={option.label}>
              {option.options.map((sub) => (
                <option key={sub.value} value={sub.value}>
                  {sub.label}
                </option>
              ))}
            </optgroup>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        )}
      </select>

      {(chevronDown || trailingIcon) && (
        <span className="dropdown-icon">
          <Icon path={trailingIcon ?? SVG_PATHS.chevronDown} size={12} />
        </span>
      )}
    </div>
  );
}
