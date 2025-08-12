// Helpers
import { formatSelectedCurrency } from "../../../helpers/formattingUtils";
import { hiddenCols } from "../../../helpers/tableHelper";

export const renderSelectedTable = ({ filtered, hasInProgress, isAdmin }) => {
  if (!filtered.length) return <p>No matching data found.</p>;

  return (
    <div className="table-scroll selected-table">
      <table>
        <thead>
          <tr>
            <th>{/* Numbers */}</th>
            {hasInProgress && <th>ACTION</th>}
            {hasInProgress && <th>NOTES</th>}

            {Object.keys(filtered[0])
              .filter((c) => isAdmin || !hiddenCols.includes(c))
              .map((c) => (
                <th key={c}>{c}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((itm, idx) => {
            const inProg = itm.KATEGORI === "IN PROCESS";
            const status = itm.STATUS ?? "No status";

            return (
              <tr
                key={idx}
                className={`tr-status-${status
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                <td className="unresponsive">
                  <p>{idx + 1}</p>
                </td>

                {hasInProgress && (
                  <td>{inProg && <p className="unresponsive">{status}</p>}</td>
                )}

                {hasInProgress && (
                  <td>{inProg && <p>{itm.NOTES ?? "-"}</p>}</td>
                )}

                {Object.keys(itm)
                  .filter((c) => isAdmin || !hiddenCols.includes(c))
                  .map((c) => (
                    <td key={c}>
                      <p>
                        {c === "REVENUE"
                          ? formatSelectedCurrency(itm[c])
                          : itm[c] ?? "-"}
                      </p>
                    </td>
                  ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
