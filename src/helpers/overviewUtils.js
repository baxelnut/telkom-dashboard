export const CUSTOM_ORDER = ["AO", "SO", "DO", "MO", "RO"];

export const SEGMEN_COLORS = {
  Government: "#FDB827",
  "Private Service": "#C70A80",
  "State-Owned Enterprise Service": "#54B435",
  Regional: "#247881",
  DEFAULT: "var(--secondary)",
};

export const COLORS = ["#e76705", "#5cb338", "#2DAA9E", "#D91656", "#7C4585"];

export const formatSegmen = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const CATEGORY_OPTIONS = [
  { value: "all", label: "ALL" },
  { value: "in_process", label: "In Process" },
  { value: "prov_complete", label: "Prov Complete" },
  { value: "provide_order", label: "Provide Order" },
  { value: "ready_to_bill", label: "Ready to Bill" },
];

export const rowPerPageOptions = [10, 20, 50, 100, 200, 500].map((val) => ({
  value: val,
  label: `Show ${val} rows`,
}));

export const formatValue = (value) => {
  const suffixes = ["", "K", "M", "B"];
  let idx = 0;
  const isNeg = value < 0;
  value = Math.abs(Number(value));

  if (isNaN(value)) return "0";

  while (value >= 1000 && idx < suffixes.length - 1) {
    value /= 1000;
    idx++;
  }

  return `${isNeg ? "-" : ""}${value.toFixed(1)}${suffixes[idx]}`;
};
