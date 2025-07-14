import { useState, useMemo } from "react";
// Chart
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
// Style
import "./SegmenRadar.css";
// Components
import CardContent from "../../components/ui/cards/CardContent";
import Dropdown from "../../components/ui/input/Dropdown";
// Custom hook
import useFetchData from "../../hooks/useFetchData";

// Helpers
const colorSet = ["#e76705", "#5cb338", "#2DAA9E", "#D91656", "#7C4585"];

export default function SegmenRadar({ API_URL }) {
  const { data, loading, error } = useFetchData(
    `${API_URL}/regional-3/sheets/segmen-simplified`
  );

  const [selectedWitel, setSelectedWitel] = useState("ALL");

  const generateColorMap = useMemo(() => {
    const colorMap = {};
    const uniqueWitels = [...new Set(data.map((item) => item.new_witel))];

    uniqueWitels.forEach((witel, index) => {
      colorMap[witel] = colorSet[index % colorSet.length];
    });

    return colorMap;
  }, [data]);

  const segmenFields = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((key) => key !== "new_witel");
  }, [data]);

  const fullMarks = useMemo(() => {
    return segmenFields.reduce((acc, field) => {
      acc[field] = Math.max(...data.map((item) => item[field] || 0), 0);
      return acc;
    }, {});
  }, [data, segmenFields]);

  const generateChartData = useMemo(() => {
    return segmenFields
      .map((field) => ({
        subject: field
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        fullMark: fullMarks[field],
        ...data.reduce((acc, item) => {
          const value = item[field] || 0;
          acc[item.new_witel] = value;
          return acc;
        }, {}),
      }))
      .filter((item) => Object.keys(item).length > 1);
  }, [data, segmenFields, fullMarks]);

  const witelOptions = useMemo(
    () => [
      { value: "ALL", label: "ALL" },
      ...[...new Set(data.map((item) => item.new_witel))].map((witel) => ({
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
        : data.filter((item) => item.new_witel === selectedWitel),
    [selectedWitel, data]
  );

  return (
    <div className="segmen-radar">
      <h6>Segmen Radar Chart</h6>
      <p>
        Showing data for segmen per witel in <strong>{selectedWitel}</strong>.
      </p>

      <CardContent
        loading={loading}
        error={error}
        children={
          <>
            <Dropdown
              options={witelOptions}
              value={selectedWitel}
              onChange={(e) => setSelectedWitel(e.target.value)}
              short
              chevronDown
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
                <Legend
                  layout="horizontal"
                  wrapperStyle={{
                    fontFamily: "var(--body)",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "var(--text)",
                    lineHeight: "1",
                  }}
                />
                {filteredData.map((item) => (
                  <Radar
                    key={item.new_witel}
                    name={item.new_witel}
                    dataKey={item.new_witel}
                    stroke={generateColorMap[item.new_witel]} // Dynamic color per witel
                    fill={generateColorMap[item.new_witel]} // Dynamic color per witel
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
        }
      />
    </div>
  );
}
