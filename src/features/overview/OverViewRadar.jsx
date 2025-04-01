import React, { useState, useEffect } from "react";
import "./OverViewRadar.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Dropdown from "../../components/utils/Dropdown";

export default function OverViewRadar({ title, subtitle, API_URL }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWitel, setSelectedWitel] = useState("ALL");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/aosodomoro/reg_3_segmen`);
        const result = await response.json();
        setData(result.data);
        setLoading(false);
      } catch (error) {
        setError(error.message || "Something went wrong while fetching data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const getDynamicFullMarks = (data) => {
    const segmenFields = [
      "regional",
      "government",
      "state-owned_enterprise_service",
      "private_service",
      "enterprise",
    ];

    const fullMarks = {};
    segmenFields.forEach((field) => {
      fullMarks[field] = Math.max(...data.map((item) => item[field]));
    });

    return fullMarks;
  };

  const generateChartData = (data) => {
    const fullMarks = getDynamicFullMarks(data);

    return [
      { subject: "Regional", fullMark: fullMarks.regional },
      { subject: "Government", fullMark: fullMarks.government },
      {
        subject: "State-Owned Enterprise Service",
        fullMark: fullMarks["state-owned_enterprise_service"],
      },
      { subject: "Private Service", fullMark: fullMarks.private_service },
      { subject: "Enterprise", fullMark: fullMarks.enterprise },
    ].map((segmen) => ({
      ...data.reduce((acc, item) => {
        acc[item.witel_name] =
          item[segmen.subject.toLowerCase().replace(/\s+/g, "_")];
        return acc;
      }, {}),
      subject: segmen.subject,
      fullMark: segmen.fullMark,
    }));
  };

  const colorSet = ["#e76705", "#5cb338", "#EB5B00", "#D91656", "#640D5F"];

  const witelOptions = [
    { value: "ALL", label: "ALL" },
    ...Array.from(new Set(data.map((item) => item.witel_name))).map(
      (witel) => ({
        value: witel,
        label: witel,
      })
    ),
  ];

  const filteredData =
    selectedWitel === "ALL"
      ? data
      : data.filter((item) => item.witel_name === selectedWitel);

  const handleChange = (e) => {
    setSelectedWitel(e.target.value);
  };

  return (
    <div className="overtime-radar-container">
      <div className="overview-radar-title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>

      <div className="overview-radar-content">
        {loading ? (
          <Loading backgroundColor="transparent" />
        ) : error ? (
          <Error message={error} />
        ) : (
          <>
            <Dropdown
              options={witelOptions}
              value={selectedWitel}
              onChange={handleChange}
            />

            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="60%"
                data={generateChartData(filteredData)}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis
                  angle={30}
                  tick={{ fontSize: 12 }}
                  domain={[
                    0,
                    Math.max(
                      ...Object.values(getDynamicFullMarks(filteredData))
                    ),
                  ]}
                />
                {filteredData.map((item, index) => (
                  <Radar
                    key={item.witel_name}
                    name={item.witel_name}
                    dataKey={item.witel_name}
                    stroke={colorSet[index % colorSet.length]}
                    fill={colorSet[index % colorSet.length]}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>

            {selectedWitel === "ALL" ? (
              <div className="radar-desc">
                {Object.keys(filteredData[0] || {}).map((key) => {
                  if (key !== "witel_name") {
                    return (
                      <p key={key}>
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                        :{" "}
                        <strong>
                          {filteredData.reduce(
                            (sum, item) => sum + (item[key] || 0),
                            0
                          )}
                        </strong>
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              filteredData.map((item, index) => (
                <div key={index} className="radar-desc">
                  {Object.entries(item).map(([key, value]) => {
                    if (key !== "witel_name") {
                      return (
                        <p key={key}>
                          {key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                          : <strong>{value}</strong>
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
