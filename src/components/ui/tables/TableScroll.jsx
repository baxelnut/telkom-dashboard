// Style
import "./TableScroll.css";

export default function TableScroll({ data, currentPage, rowsPerPage }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>{/* Numbers */}</th>
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key} className="unresponsive">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td className="unresponsive">
                {currentPage * rowsPerPage + index + 1}
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
