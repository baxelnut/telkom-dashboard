// Style
import "./CustomTooltip.css";

const colorsBySegmen = {
  Government: "#FDB827",
  "Private Service": "#C70A80",
  "State-Owned Enterprise Service": "#54B435",
  Regional: "#247881",
  DEFAULT: "var(--secondary)",
};

// Optional formatter: pass formatValue if needed, else it will just use raw value
export default function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((entry, index) => {
        const segmen = entry.name;
        const color = colorsBySegmen[segmen] || colorsBySegmen.DEFAULT;
        const value = formatter ? formatter(entry.value) : entry.value;
        return (
          <p
            key={`tooltip-item-${index}`}
            className="tooltip-item"
            style={{ color }}
          >
            {segmen}: {value}
          </p>
        );
      })}
    </div>
  );
}
