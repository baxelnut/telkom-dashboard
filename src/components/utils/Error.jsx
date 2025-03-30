import React from "react";
import "./Error.css";

export default function Error({ message }) {
  const displayMessage = message?.trim() ? message : "Something went wrong!";

  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p className="error-message">{displayMessage}</p>
    </div>
  );
}
