// Style
import "./ActionTable.css";
// Helpers
import {
  STATUSES,
  getStatusColors,
  bucketCounts,
} from "../../helpers/actionBasedUtils";

export default function ActionTable({ data, onRowClick }) {
  const STATUS_COLORS = getStatusColors();
  const rows = data.data || [];

  const cellClass = (count, base) => (count === 0 ? "unresponsive" : base);
  const handleCellClick = (witel, po, period, status) => () =>
    onRowClick(witel, po, period, status);

  const renderStatusHeaders = (prefix) =>
    STATUSES.map((s) => (
      <td
        key={`${prefix}-${s}`}
        className="render-status"
        style={{ backgroundColor: STATUS_COLORS[s] }}
      >
        <strong>{s}</strong>
      </td>
    ));

  const renderBucketCells = (bucket, prefix, witel, po, period) =>
    STATUSES.map((s) => (
      <td
        key={`${prefix}-${s}`}
        className={cellClass(bucket[s], `${prefix}-cell`)}
        style={{ cursor: "pointer" }}
        onClick={handleCellClick(witel, po, period, s)}
      >
        {bucket[s]}
      </td>
    ));

  return (
    <div className="action-table">
      <table>
        <thead>
          <tr>
            <th rowSpan="2">PO</th>
            <th rowSpan="2">WITEL</th>
            <th colSpan={STATUSES.length + 1}>&lt;3 BLN</th>
            <th colSpan={STATUSES.length + 1}>&gt;3 BLN</th>
            <th rowSpan="2">GRAND TOTAL</th>
          </tr>
          <tr>
            {renderStatusHeaders("u")}
            <th>Total</th>
            {renderStatusHeaders("o")}
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => {
            const { PO_NAME, WITEL, items = [] } = row;
            const under = bucketCounts(items, "<", PO_NAME);
            const over = bucketCounts(items, ">", PO_NAME);
            const grandTotal = under.TOTAL + over.TOTAL;

            return (
              <tr key={idx} className="action-table-row">
                <td
                  className="po-name"
                  onClick={handleCellClick(
                    WITEL,
                    PO_NAME,
                    "ALL PERIOD",
                    "ALL STATUS"
                  )}
                >
                  <strong>{PO_NAME}</strong>
                </td>

                <td
                  className="witel-name"
                  onClick={handleCellClick(
                    WITEL,
                    "ALL PO",
                    "ALL PERIOD",
                    "ALL STATUS"
                  )}
                >
                  {WITEL}
                </td>

                {renderBucketCells(under, "u", WITEL, PO_NAME, "<3")}
                <td
                  className={cellClass(under.TOTAL, "tot-cell")}
                  onClick={handleCellClick(WITEL, PO_NAME, "<3", "ALL STATUS")}
                >
                  <strong>{under.TOTAL}</strong>
                </td>

                {renderBucketCells(over, "o", WITEL, PO_NAME, ">3")}
                <td
                  className={cellClass(over.TOTAL, "tot-cell")}
                  onClick={handleCellClick(WITEL, PO_NAME, ">3", "ALL STATUS")}
                >
                  <strong>{over.TOTAL}</strong>
                </td>

                <td
                  className={cellClass(grandTotal, "tot-cell grand-total-cell")}
                  onClick={handleCellClick(
                    WITEL,
                    PO_NAME,
                    "ALL PERIOD",
                    "ALL STATUS"
                  )}
                >
                  <strong>{grandTotal}</strong>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
