// Style
import "./TableScroll.css";

export default function TableScroll({ data, currentPage, rowsPerPage }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>
              <h6 className="small-h">{/* Empty header for row numbers */}</h6>
            </th>
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key}>
                <h6 className="small-h">{key}</h6>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td className="unresponsive">
                <p>{currentPage * rowsPerPage + index + 1}</p>
              </td>
              {Object.values(row).map((value, i) => (
                <td
                  key={i}
                  className={!value || value == "NULL" ? "unresponsive" : ""}
                >
                  <p>{value || "-"}</p>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
