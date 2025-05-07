import React from "react";
import "./GalaksiTable.css";
import Loading from "../../../components/utils/Loading";
import Error from "../../../components/utils/Error";

const SUBTYPES = ["AO", "SO", "DO", "MO", "RO"];

export default function GalaksiTable({ galaksiData, loading, error }) {
  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error message={error} />;

  const achData = galaksiData?.ach?.data || [];
  const poData = galaksiData?.po?.data || [];

  const achMap = {};
  achData.forEach((item) => {
    const pic = item.PIC || "Unknown";
    const subtype = item.ORDER_SUBTYPE2;

    if (!achMap[pic]) {
      achMap[pic] = SUBTYPES.reduce((acc, key) => ({ ...acc, [key]: 0 }), {
        total: 0,
      });
    }

    if (SUBTYPES.includes(subtype)) {
      achMap[pic][subtype]++;
      achMap[pic].total++;
    }
  });

  const tableRows = poData.map((po) => {
    const name = po.PO_NAME;
    const counts =
      achMap[name] ||
      SUBTYPES.reduce((acc, key) => ({ ...acc, [key]: 0 }), {
        total: 0,
      });

    return {
      name,
      counts,
    };
  });

  function calculateAchievement(total) {
    if (total === 0) return "100%";
    if (total <= 5) return "80%";
    if (total <= 10) return "60%";
    if (total <= 20) return "40%";
    return "20%"; // > 20
  }

  // Calculate grand totals
  const grandTotal = SUBTYPES.reduce((acc, type) => {
    acc[type] = tableRows.reduce((sum, { counts }) => sum + counts[type], 0);
    return acc;
  }, {});

  grandTotal.total = SUBTYPES.reduce((sum, type) => sum + grandTotal[type], 0);

  return (
    <div className="galaksi-table">
      <table>
        <thead>
          <tr>
            <th rowSpan="2">
              <h6>Project Operation</h6>
            </th>
            <th colSpan={SUBTYPES.length}>
              <h6>&gt;3 BLN</h6>
            </th>
            <th rowSpan="2">
              <h6>Grand Total</h6>
            </th>
            <th rowSpan="2">
              <h6>Achievement (%)</h6>
            </th>
          </tr>
          <tr>
            {SUBTYPES.map((type) => (
              <th key={type}>
                <h6>{type}</h6>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map(({ name, counts }) => (
            <tr key={name}>
              <td className="unresponsive">
                <p>{name}</p>
              </td>
              {SUBTYPES.map((type) => (
                <td key={type} className="unresponsive">
                  <p>{counts[type]}</p>
                </td>
              ))}
              <td className="unresponsive">
                <p>{counts.total}</p>
              </td>
              <td className="unresponsive">
                <h6>{calculateAchievement(counts.total)}</h6>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td className="unresponsive">
              <h6>GRAND TOTAL</h6>
            </td>
            {SUBTYPES.map((type) => (
              <td key={type} className="unresponsive">
                <p>{grandTotal[type]}</p>
              </td>
            ))}
            <td className="unresponsive">
              <p>{grandTotal.total}</p>
            </td>
            <td className="filler"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
