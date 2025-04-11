import React from "react";
import "./Performancesummarize.css";
import Loading from "../../components/utils/Loading";

export default function PerformanceSummarize({ statusData }) {
  const totalValue = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="performance-summarize">
      <div className="summary-container">
        <h5>In Progress Status</h5>
        <p>Showing visualization for In Progress Status.</p>

        <div className="status-graph-container">
          {statusData.map((item, index) => {
            const itemPercentage = ((item.value / totalValue) * 100).toFixed(2);

            return (
              <div key={index} className="status-bar-container">
                <p className="status-text">{item.value}</p>

                <div className="object-container">
                  <p style={{ fontWeight: "bold" }}>{item.title}</p>

                  <div className="status-bar">
                    <div
                      className="status-bar-active"
                      style={{ width: `${itemPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <p
                  className="status-text"
                  style={{
                    width: "100px",
                    flexDirection: "column-reverse",
                    justifyContent: "center",
                    alignItems: "end",
                  }}
                >
                  {itemPercentage}%
                </p>
              </div>
            );
          })}
        </div>

        <div className="table-wrapper">
          <Loading />
        </div>

        <button type="button">
          <h6>See all details</h6>
        </button>

        <h5>Summary</h5>
        <p>Showing summary for In Progress Status.</p>
        <div className="summary-table-wrapper">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.{" "}
          </p>

          <div className="circle-avatar-container">
            {statusData.map((item, index) => {
              return (
                <div
                  key={index}
                  className="circle-avatar"
                  style={{ backgroundColor: `${item.backgroundColor}` }}
                >
                  <p>{item.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        <button type="button">
          <h6>See all details</h6>
        </button>
      </div>

      <div className="detailed-container">
        <div className="detailed-bar-container">
          <h5>In Progress Status</h5>
          <p>Showing visualization for In Progress Status.</p>

          <div className="detaield-content-text">
            <p>0%</p> <p>100%</p>
          </div>
          <div className="detailed-content-container">
            {statusData.map((item, index) => {
              const itemPercentage = ((item.value / totalValue) * 100).toFixed(
                2
              );

              return (
                <div
                  key={index}
                  className="item-bar"
                  style={{
                    backgroundColor: item.backgroundColor,
                    width: `${itemPercentage}%`,
                    borderRadius:
                      index === 0
                        ? "12px 0 0 12px"
                        : index === statusData.length - 1
                        ? "0 12px 12px 0"
                        : "0",
                  }}
                ></div>
              );
            })}
          </div>

          <div className="detailed-desc">
            {statusData.map((item, index) => {
              const itemPercentage = ((item.value / totalValue) * 100).toFixed(
                2
              );

              return (
                <div key={index} className="desc-item">
                  <div className="desc-item-title">
                    <div
                      className="box"
                      style={{ backgroundColor: `${item.backgroundColor}` }}
                    ></div>
                    <p>{item.title}</p>
                  </div>

                  <h5>{item.value}</h5>
                  <p>{itemPercentage}%</p>
                </div>
              );
            })}
          </div>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.{" "}
          </p>

          <button type="button">
            <h6>See all details</h6>
          </button>
        </div>

        <div className="detailed-cards-container">
          <h5>In Progress Status</h5>
          <p>Showing visualization for In Progress Status.</p>

          <div className="detailed-cards-content-container">
            {statusData.map((item, index) => {
              return (
                <div key={index} className="detailed-cards-item">
                  <h6>{item.title}</h6>
                  <p style={{ backgroundColor: `${item.backgroundColor}` }}>
                    {item.icon}
                  </p>
                </div>
              );
            })}
          </div>

          <button type="button">
            <h6>See all details</h6>
          </button>
        </div>
      </div>
    </div>
  );
}
