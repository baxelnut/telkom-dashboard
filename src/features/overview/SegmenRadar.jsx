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
const COLORS = ["#e76705", "#5cb338", "#2DAA9E", "#D91656", "#7C4585"];
const formatSegmen = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function SegmenRadar({ API_URL }) {
  const { data, loading, error } = useFetchData(
    `${API_URL}/regional-3/sheets/segmen-simplified`
  );
  const [selectedWitel, setSelectedWitel] = useState("ALL");

  // Extract once and reuse
  const uniqueWitels = useMemo(
    () => [...new Set(data.map((item) => item.new_witel))],
    [data]
  );

  const colorMap = useMemo(() => {
    return uniqueWitels.reduce((map, witel, i) => {
      map[witel] = COLORS[i % COLORS.length];
      return map;
    }, {});
  }, [uniqueWitels]);

  const segmenFields = useMemo(() => {
    return data[0]
      ? Object.keys(data[0]).filter((key) => key !== "new_witel")
      : [];
  }, [data]);

  const fullMarks = useMemo(() => {
    return segmenFields.reduce((acc, field) => {
      acc[field] = Math.max(...data.map((d) => d[field] || 0), 0);
      return acc;
    }, {});
  }, [data, segmenFields]);

  const chartData = useMemo(() => {
    return segmenFields.map((field) => ({
      subject: formatSegmen(field),
      fullMark: fullMarks[field],
      ...data.reduce((acc, item) => {
        acc[item.new_witel] = item[field] || 0;
        return acc;
      }, {}),
    }));
  }, [data, segmenFields, fullMarks]);

  const witelOptions = useMemo(
    () =>
      [{ value: "ALL", label: "ALL" }].concat(
        uniqueWitels.map((witel) => ({ value: witel, label: witel }))
      ),
    [uniqueWitels]
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
              <RadarChart cx="50%" cy="50%" outerRadius="60%" data={chartData}>
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
                    stroke={colorMap[item.new_witel]}
                    fill={colorMap[item.new_witel]}
                    fillOpacity={0.3}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>

            <div className="radar-desc">
              {segmenFields.map((field) => (
                <p key={field}>
                  {formatSegmen(field)}:{" "}
                  <strong>
                    {filteredData.reduce(
                      (sum, item) => sum + (item[field] || 0),
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
