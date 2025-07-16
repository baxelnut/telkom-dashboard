export const STATUSES = ["Lanjut", "Cancel", "Bukan Order Reg", "No Status"];

export const ACT_OPS = ["Lanjut", "Cancel", "Bukan Order Reg"].map((v) => ({
  value: v,
  label: v,
}));

export const getStatusColors = () => {
  const styles = getComputedStyle(document.documentElement);
  const getRGBA = (cssVarName) =>
    `rgba(${styles.getPropertyValue(`${cssVarName}-rgb`).trim()}, 0.5)`;
  return {
    Lanjut: getRGBA("--success"),
    Cancel: getRGBA("--error"),
    "Bukan Order Reg": getRGBA("--secondary"),
    "No Status": "transparent",
  };
};

export const getLogLine = (email) => {
  const d = new Date();
  return `Last edited: ${d.toLocaleDateString("id-ID")} ${d
    .toTimeString()
    .slice(0, 5)} by ${email}`;
};

export const bucketCounts = (items, bucket, selectedPic) => {
  const counts = {
    Lanjut: 0,
    Cancel: 0,
    "Bukan Order Reg": 0,
    "No Status": 0,
  };
  items.forEach((itm) => {
    if (
      itm._bucket === bucket &&
      itm.KATEGORI === "IN PROCESS" &&
      itm.PIC === selectedPic
    ) {
      const raw = (itm.STATUS || "").trim();
      if (!raw) {
        counts["No Status"]++;
      } else {
        const key = {
          lanjut: "Lanjut",
          cancel: "Cancel",
          "bukan order reg": "Bukan Order Reg",
        }[raw.toLowerCase()];
        if (key) {
          counts[key]++;
        } else {
          counts["No Status"]++;
        }
      }
    }
  });
  counts.TOTAL =
    counts.Lanjut +
    counts.Cancel +
    counts["Bukan Order Reg"] +
    counts["No Status"];
  return counts;
};
