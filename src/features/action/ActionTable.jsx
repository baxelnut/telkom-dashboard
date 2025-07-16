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
      <td key={`${prefix}-${s}`} style={{ backgroundColor: STATUS_COLORS[s] }}>
        <h6>{s}</h6>
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
        <p>{bucket[s]}</p>
      </td>
    ));

  return (
    <div className="action-table">
      <table>
        <thead>
          <tr>
            <th rowSpan="2">
              <h6>PO</h6>
            </th>
            <th rowSpan="2">
              <h6>WITEL</h6>
            </th>
            <th colSpan={STATUSES.length + 1}>
              <h6>&lt;3 BLN</h6>
            </th>
            <th colSpan={STATUSES.length + 1}>
              <h6>&gt;3 BLN</h6>
            </th>
            <th rowSpan="2">
              <h6>GRAND TOTAL</h6>
            </th>
          </tr>
          <tr>
            {renderStatusHeaders("u")}
            <th>
              <h6>Total</h6>
            </th>
            {renderStatusHeaders("o")}
            <th>
              <h6>Total</h6>
            </th>
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
                  <p>{PO_NAME}</p>
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
                  <p>{WITEL}</p>
                </td>

                {renderBucketCells(under, "u", WITEL, PO_NAME, "<3")}
                <td
                  className={cellClass(under.TOTAL, "tot-cell")}
                  onClick={handleCellClick(WITEL, PO_NAME, "<3", "ALL STATUS")}
                >
                  <h6>{under.TOTAL}</h6>
                </td>

                {renderBucketCells(over, "o", WITEL, PO_NAME, ">3")}
                <td
                  className={cellClass(over.TOTAL, "tot-cell")}
                  onClick={handleCellClick(WITEL, PO_NAME, ">3", "ALL STATUS")}
                >
                  <h6>{over.TOTAL}</h6>
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
                  <h6>{grandTotal}</h6>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
