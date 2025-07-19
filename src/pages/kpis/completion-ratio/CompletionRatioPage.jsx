import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
// Style
import "./CompletionRatioPage.css";
// Components
import CardContent from "../../../components/ui/cards/CardContent";
// Custom hook
import useFetchData from "../../../hooks/useFetchData";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const completed =
      payload.find((d) => d.dataKey === "completed")?.value || 0;
    const total = payload.find((d) => d.dataKey === "total")?.value || 0;
    const ratio = total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0";
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p>
          Completed: <strong>{completed}</strong>
        </p>
        <p>
          Total: <strong>{total}</strong>
        </p>
        <p>
          Ratio: <strong>{ratio}%</strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function CompletionRatioPage({ API_URL }) {
  const { data, loading, error } = useFetchData(
    `${API_URL}/regional-3/sheets/process-status`
  );

  const categories = data.map((item) => {
    const completed = item.lanjut;
    const total =
      item.lanjut + item.cancel + item.bukan_order_reg + item.no_status;
    return {
      name: item.new_witel,
      completed,
      total,
    };
  });
  const totalCompleted = categories.reduce((sum, c) => sum + c.completed, 0);
  const totalOrders = categories.reduce((sum, c) => sum + c.total, 0);
  const overallRatio = ((totalCompleted / totalOrders) * 100).toFixed(1);

  return (
    <div className="completion-ratio-page">
      <div className="card chart">
        <h6>Completion vs Total Orders</h6>
        <CardContent
          loading={loading}
          error={error}
          children={
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 14, fill: "var(--text)" }}
                />
                <YAxis
                  tick={{ fontSize: 14, fill: "var(--text)" }}
                  orientation="left"
                />
                <Tooltip
                  content={(props) => (
                    <CustomTooltip {...props} total={totalOrders} />
                  )}
                />
                <Bar dataKey="completed" fill="var(--success)">
                  <LabelList
                    dataKey="completed"
                    position="top"
                    fill="var(--text)"
                    fontSize={14}
                  />
                </Bar>
                <Bar dataKey="total" fill="var(--primary)">
                  <LabelList
                    dataKey="total"
                    position="top"
                    fill="var(--text)"
                    fontSize={14}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          }
        />
      </div>

      <div className="card summary">
        <h6>Total Completion</h6>
        <CardContent
          loading={loading}
          error={error}
          children={
            <>
              <div className="progress-wrapper">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${overallRatio}%` }}
                  ></div>
                </div>
                <div>
                  <span className="small-h">
                    {totalCompleted} / {totalOrders}{" "}
                  </span>
                  <span>orders completed ({overallRatio}%)</span>
                </div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Witel</th>
                      <th>Completed (lanjut)</th>
                      <th>Total Populasi</th>
                      <th>Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat, idx) => {
                      const ratio = ((cat.completed / cat.total) * 100).toFixed(
                        1
                      );
                      return (
                        <tr key={idx}>
                          <td>
                            <strong>{cat.name}</strong>
                          </td>
                          <td>{cat.completed}</td>
                          <td>{cat.total}</td>
                          <td>
                            <strong>{ratio}%</strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          }
        />
      </div>
    </div>
  );
}
