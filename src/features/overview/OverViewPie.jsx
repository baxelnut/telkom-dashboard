import React from "react";
import "./OverViewPie.css";
import Loading from "../../components/Loading";

export default function OverViewPie({ title, subtitle, overviewPie }) {
  return (
    <div className="overview-pie-container">
      <div className="overview-pie-title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>

      <div className="overview-pie-content">
        <Loading backgroundColor="transparent" />
      </div>
    </div>
  );
}
