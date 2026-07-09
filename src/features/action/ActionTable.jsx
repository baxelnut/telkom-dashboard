// Style
import "./ActionTable.css";
// Helpers
import {
  STATUSES,
  getStatusColors,
  bucketCounts,
} from "../../helpers/actionBasedUtils";

/**
 * Props:
 *  - data: { data: [...] }
 *  - onRowClick: (witel, po, period, status) => void
 *  - bucket: "<" | ">"  // which bucket this table renders
 */
export default function ActionTable({ data, onRowClick, bucket = "<" }) {
  const STATUS_COLORS = getStatusColors();
  const rows = data.data || [];

  const cellClass = (count, base) => (count === 0 ? "unresponsive" : base);

  // map bucket symbol to the period string your app expects when navigating
  const periodForBucket = bucket === "<" ? "<2" : ">2";

  const handleCellClick = (witel, po, period, status) => () =>
    onRowClick(witel, po, period, status);

  const renderStatusHeaders = () =>
    STATUSES.map((s) => (
      <th
        key={s}
        className="render-status"
        style={{ backgroundColor: STATUS_COLORS[s] }}
      >
        <strong>{s}</strong>
      </th>
    ));

  const renderBucketCells = (bucketCountsObj, prefix, witel, po) =>
    STATUSES.map((s) => (
      <td
        key={`${prefix}-${s}`}
        className={cellClass(bucketCountsObj[s], `${prefix}-cell`)}
        style={{ cursor: "pointer" }}
        onClick={handleCellClick(witel, po, periodForBucket, s)}
      >
        {bucketCountsObj[s]}
      </td>
    ));

  return (
    <div className="action-table">
      <table>
        <thead>
          <tr>
            <th>PO</th>
            <th>WITEL</th>
            {renderStatusHeaders()}
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => {
            const { PO_NAME, WITEL, items = [] } = row;
            // use the provided bucket to count only items in that bucket
            const counts = bucketCounts(items, bucket, PO_NAME);

            return (
              <tr key={idx} className="action-table-row">
                {/* Clicking PO opens details for this PO scoped to this bucket */}
                <td
                  className="po-name"
                  onClick={handleCellClick(
                    WITEL,
                    PO_NAME,
                    periodForBucket,
                    "ALL STATUS",
                  )}
                >
                  <strong>{PO_NAME}</strong>
                </td>

                {/* Clicking WITEL opens details for this WITEL scoped to this bucket */}
                <td
                  className="witel-name"
                  onClick={handleCellClick(
                    WITEL,
                    "ALL PO",
                    periodForBucket,
                    "ALL STATUS",
                  )}
                >
                  {WITEL}
                </td>

                {/* Status columns */}
                {renderBucketCells(
                  counts,
                  bucket === "<" ? "u" : "o",
                  WITEL,
                  PO_NAME,
                )}

                {/* Total for this bucket */}
                <td
                  className={cellClass(counts.TOTAL, "tot-cell")}
                  onClick={handleCellClick(
                    WITEL,
                    PO_NAME,
                    periodForBucket,
                    "ALL STATUS",
                  )}
                >
                  <strong>{counts.TOTAL}</strong>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
