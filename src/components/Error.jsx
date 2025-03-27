import React from "react";
import "./Error.css";

export default function Error({ message = "Something went wrong!" }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p className="error-message">{message}</p>
    </div>
  );
}
