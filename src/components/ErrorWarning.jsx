import React from "react";
import "./ErrorWarning.css";

export default function ErrorWarning({ e }) {
  return (
    <div className="error-fancy">
      <h3>Error</h3>
      <h6>Try again later</h6>
      <p>{e}</p>
    </div>
  );
}
