import React, { useState, useEffect, useMemo } from "react";
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

const colorSet = ["#5cb338", "#e76705", "#2DAA9E", "#D91656", "#640D5F"];

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
        setData(result.data || []);
      } catch (error) {
        setError(error.message || "Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const segmenFields = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((key) => key !== "witel_name");
  }, [data]);

  const fullMarks = useMemo(() => {
    return segmenFields.reduce((acc, field) => {
      acc[field] = Math.max(...data.map((item) => item[field] || 0), 0);
      return acc;
    }, {});
  }, [data, segmenFields]);

  const generateChartData = useMemo(() => {
    return segmenFields.map((field) => ({
      subject: field
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      fullMark: fullMarks[field],
      ...data.reduce((acc, item) => {
        acc[item.witel_name] = item[field] || 0;
        return acc;
      }, {}),
    }));
  }, [data, segmenFields, fullMarks]);

  const witelOptions = useMemo(
    () => [
      { value: "ALL", label: "ALL" },
      ...[...new Set(data.map((item) => item.witel_name))].map((witel) => ({
        value: witel,
        label: witel,
      })),
    ],
    [data]
  );

  const filteredData = useMemo(
    () =>
      selectedWitel === "ALL"
        ? data
        : data.filter((item) => item.witel_name === selectedWitel),
    [selectedWitel, data]
  );

  return (
    <div className="overtime-radar-container">
      <div className="overview-radar-title">
        <h4>{title}</h4>
        <p>{`${subtitle} ${selectedWitel}`}</p>
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
              onChange={(e) => setSelectedWitel(e.target.value)}
            />

            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="60%"
                data={generateChartData}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis
                  angle={30}
                  tick={{ fontSize: 12 }}
                  domain={[0, Math.max(...Object.values(fullMarks))]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
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
              </RadarChart>
            </ResponsiveContainer>

            <div className="radar-desc">
              {segmenFields.map((key) => (
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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
