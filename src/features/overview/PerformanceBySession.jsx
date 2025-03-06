import React, { useState, useEffect } from "react";
import "./PerformanceBySession.css";
import Loading from "../../components/Loading";

export default function PerformanceBySession({
  data,
  title,
  subtitle,
  loading,
  error,
}) {
  if (loading)
    return (
      <div className="p-by-session">
        <Loading />
      </div>
    );
  if (error || !data || data.length === 0) return <p>Error: {error}</p>;

  return (
    <div className="p-by-session">
      <div className="title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>
      <div className="main">
        {data.map((customer, index) => (
          <div className="widget" key={index}>
            <div className="head">
              <h6 title={customer.name}>{customer.name}</h6>
              <h6>
                {customer.sessions} • {customer.percentage.toFixed(2)}%
              </h6>
            </div>
            <div className="bar">
              <div
                className="active"
                style={{ width: `${customer.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
