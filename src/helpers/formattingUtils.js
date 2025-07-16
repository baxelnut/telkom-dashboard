export function formatDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export const formatCurrency = (value) => {
  if (!value || isNaN(value)) return "Rp0";
  const absValue = Math.abs(value).toLocaleString("id-ID");
  return value < 0 ? `-Rp${absValue}` : `Rp${absValue}`;
};

export const formatSelectedCurrency = (v) =>
  v ? `Rp${v.toLocaleString("id-ID")}` : "Rp0";
