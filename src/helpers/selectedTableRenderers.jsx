import { formatCurrency } from "./selectedUtils";

export const renderSelectedTable = ({ filtered, hasInProgress }) => {
  if (!filtered.length) return <p>No matching data found.</p>;

  return (
    <div className="table-scroll selected-table">
      <table>
        <thead>
          <tr>
            <th>
              <h6>{/* For numbering */}</h6>
            </th>
            {hasInProgress && (
              <th>
                <h6>ACTION</h6>
              </th>
            )}
            {hasInProgress && (
              <th>
                <h6>NOTES</h6>
              </th>
            )}
            {Object.keys(filtered[0]).map((c) => (
              <th key={c}>
                <h6>{c}</h6>
              </th>
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

                {Object.keys(itm).map((c) => (
                  <td key={c}>
                    <p>
                      {c === "REVENUE" ? formatCurrency(itm[c]) : itm[c] ?? "-"}
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
