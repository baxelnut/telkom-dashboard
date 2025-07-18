// Blank count object based on provided order keys.
export function createEmptyCountMap(orderKeys = []) {
  return orderKeys.reduce((acc, key) => ({ ...acc, [key]: 0 }), { total: 0 });
}

// Map achievement data into a normalized structure keyed by PIC
export function mapAchievementData(
  data = [],
  orderKeys = [],
  subtypeKey = "ORDER_SUBTYPE2",
  nameKey = "PIC"
) {
  const result = {};
  data.forEach((item) => {
    const name = item[nameKey] || "Unknown";
    const subtype = item[subtypeKey];
    if (!result[name]) {
      result[name] = createEmptyCountMap(orderKeys);
    }
    if (orderKeys.includes(subtype)) {
      result[name][subtype]++;
      result[name].total++;
    }
  });
  return result;
}

// Merge PO data with achievement counts
export function buildTableRows(
  poData = [],
  achMap = {},
  orderKeys = [],
  nameKey = "PO_NAME"
) {
  return poData.map((po) => {
    const name = po[nameKey];
    const counts = achMap[name] || createEmptyCountMap(orderKeys);
    return { name, counts };
  });
}

// Thresholds used in explanation and calculation
export const ACH_THRESHOLDS = [
  { max: 0, value: "100%", range: "0" },
  { max: 5, value: "80%", range: "1–5" },
  { max: 10, value: "60%", range: "6–10" },
  { max: 20, value: "40%", range: "11–20" },
  { max: Infinity, value: "20%", range: ">20" },
];

// Calculate percentage achievement based on total
export function calculateAchievement(total = 0) {
  const threshold = ACH_THRESHOLDS.find(({ max }) => total <= max);
  return threshold ? threshold.value : "N/A";
}

// Calculate grand totals for the whole table
export function calculateGrandTotal(tableRows = [], orderKeys = []) {
  const grand = orderKeys.reduce((acc, type) => {
    acc[type] = tableRows.reduce((sum, { counts }) => sum + counts[type], 0);
    return acc;
  }, {});
  grand.total = orderKeys.reduce((sum, type) => sum + grand[type], 0);
  return grand;
}
