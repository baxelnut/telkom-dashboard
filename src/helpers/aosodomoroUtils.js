export const formatCurrency = (value) => {
  if (!value || isNaN(value)) return "Rp0";
  const absValue = Math.abs(value).toLocaleString("id-ID");
  return value < 0 ? `-Rp${absValue}` : `Rp${absValue}`;
};

export const normalizeRevenue = (i) => {
  if (!i || typeof i !== "object") return 0;
  return ["SO", "DO"].includes(i.ORDER_SUBTYPE2) ? -i.REVENUE : i.REVENUE;
};
