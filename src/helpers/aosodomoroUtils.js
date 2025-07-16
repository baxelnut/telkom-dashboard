export const normalizeRevenue = (i) => {
  if (!i || typeof i !== "object") return 0;
  return ["SO", "DO"].includes(i.ORDER_SUBTYPE2) ? -i.REVENUE : i.REVENUE;
};

export const ORDER_SUBTYPE = [
  "PROV. COMPLETE",
  "PROVIDE ORDER",
  "IN PROCESS",
  "READY TO BILL",
];

export const SEGMEN_OPS = [
  "ALL",
  "Regional",
  "Private Service",
  "State-Owned Enterprise Service",
  "Government",
].map((value) => ({ value, label: value }));
