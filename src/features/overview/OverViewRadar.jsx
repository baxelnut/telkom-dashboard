import React from "react";
import "./OverViewRadar.css";
import Loading from "../../components/Loading";

export default function OverViewRadar({ title, subtitle, overviewRadar }) {
  return (
    <div className="overtime-radar-container">
      <div className="overview-radar-title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>

      <div className="overview-radar-content">
        <Loading backgroundColor="transparent" />
      </div>
    </div>
  );
}
