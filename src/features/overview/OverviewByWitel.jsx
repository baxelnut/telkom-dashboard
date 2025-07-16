import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
// Style
import "./OverviewByWitel.css";
// Components
import Error from "../../components/ui/states/Error";
import Loading from "../../components/ui/states/Loading";
// Custom hook
import useFetchData from "../../hooks/useFetchData";

// Helpers
const getStatusColors = () => {
  const styles = getComputedStyle(document.documentElement);
  return {
    lanjut: styles.getPropertyValue("--success").trim(),
    cancel: styles.getPropertyValue("--error").trim(),
    bukan_order_reg: styles.getPropertyValue("--secondary").trim(),
    no_status: styles.getPropertyValue("--neutral").trim(),
  };
};

const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length || !total) return null;
  const { name, value, color } = payload[0];
  const percent = ((value / total) * 100).toFixed(1);
  return (
    <div className="custom-tooltip">
      <p>{name}</p>
      <p>→</p>
      <h6 className="small-h" style={{ color }}>{`${percent}%`}</h6>
    </div>
  );
};

export default function OverviewByWitel({ API_URL }) {
  const { data, loading, error } = useFetchData(
    `${API_URL}/regional-3/sheets/process-status`
  );

  const navigate = useNavigate();

  if (loading || error || !data) {
    return (
      <div className="cards-container-grid">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="card overview-by-witel ">
            {loading ? <Loading backgroundColor="transparent" /> : <Error />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="cards-container-grid">
      {data.map((overviewStatus, index) => {
        const statuses = Object.entries(getStatusColors());
        const pieData = statuses
          .map(([key, color]) => ({
            key,
            name: key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            value: overviewStatus[key] || 0,
            color,
          }))
          .filter((item) => item.value > 0);
        const total = pieData.reduce((acc, cur) => acc + cur.value, 0);
        return (
          <div
            key={index}
            className="card overview-by-witel"
            onClick={() => navigate("/reports/aosodomoro")}
          >
            <h6 className="witel-name">
              {overviewStatus["new_witel"] || "Unknown"}
            </h6>
            <div className="graph-container">
              <PieChart width={200} height={220}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={(props) => (
                    <CustomTooltip {...props} total={total} />
                  )}
                />
              </PieChart>
            </div>
            <div className="o-pie-dec-container">
              {pieData.map((item, i) => (
                <div key={i} className="o-pie-dec">
                  <p style={{ color: item.color }}>
                    {item.name} ({`${((item.value / total) * 100).toFixed(1)}%`}
                    )
                  </p>
                  <p className="small-h" style={{ color: item.color }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
