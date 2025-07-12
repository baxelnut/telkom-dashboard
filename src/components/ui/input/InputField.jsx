import { useState } from "react";
// Style
import "./InputField.css";

export default function InputField({
  type = "text",
  label = "",
  placeholder = "",
  value,
  onChange,
  name,
  obscurial,
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
              value={value}
              onChange={onChange}
              required={required}
              autoFocus={autoFocus}
              disabled={disabled}
              className="custom-input"
            />
            {isPassword && (
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? (
                  // Eye Slash SVG
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                  </svg>
                ) : (
                  // Eye SVG
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                  </svg>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
