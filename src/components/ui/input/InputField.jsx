  import { useState } from "react";
  // Style
  import "./InputField.css";
  // Components
  import Icon from "../icons/Icon";
  // Data
  import { SVG_PATHS } from "../../../data/utilsData";

  export default function InputField({
    className = "",
    type = "text",
    label = "",
    placeholder = "",
    value,
    accept = "",
    onChange,
    name,
    obscurial,
    isId = false,
    required = false,
    fullWidth = false,
    autoFocus = false,
    disabled = false,
    isTextarea = false,
    resizable = false,
    minHeight = "80px",
  }) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password" && obscurial;

    return (
      <div className={`input-wrapper ${fullWidth ? "full-width" : ""}`}>
        {label && <label htmlFor={name}>{label}</label>}
        <div className="input-container">
          {isTextarea ? (
            <textarea
              id={name}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              required={required}
              autoFocus={autoFocus}
              disabled={disabled}
              className={`custom-input ${resizable ? "resizable" : ""}`}
              style={{ minHeight }}
            />
          ) : (
            <>
              <input
                id={name}
                name={name}
                type={isPassword && showPassword ? "text" : type}
                placeholder={placeholder}
                value={
                  isId && value !== ""
                    ? value.startsWith("@")
                      ? value
                      : `@${value.replace(/^@*/, "")}`
                    : value
                }
                onChange={(e) => {
                  let val = e.target.value;
                  if (isId) {
                    // Always ensure value starts with "@"
                    if (!val.startsWith("@")) {
                      val = "@" + val.replace(/^@*/, "");
                    }
                  }
                  onChange({ target: { value: val, name: e.target.name } });
                }}
                required={required}
                autoFocus={autoFocus}
                disabled={disabled}
                className={`custom-input ${className}`}
                accept={accept}
              />
              {isPassword && (
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  <Icon
                    path={showPassword ? SVG_PATHS.eyeSlash : SVG_PATHS.eye}
                  />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
