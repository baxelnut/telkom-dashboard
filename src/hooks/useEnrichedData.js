import { useMemo } from "react";

export default function useEnrichedData(data) {
  return useMemo(() => {
    if (!data?.po || !data?.report) return [];
    return data.po.map((po) => {
      const report = data.report.find((r) => r.witelName === po.WITEL);
      const inProc = report?.["IN PROCESS"] || {};
      const items = [
        ...(inProc["<3blnItems"] || []).map((i) => ({ ...i, _bucket: "<" })),
        ...(inProc[">3blnItems"] || []).map((i) => ({ ...i, _bucket: ">" })),
      ];
      const count = { Lanjut: 0, Cancel: 0, "Bukan Order Reg": 0 };
      items.forEach(({ STATUS, KATEGORI }) => {
        if (KATEGORI !== "IN PROCESS") return;
        const key =
          {
            lanjut: "Lanjut",
            cancel: "Cancel",
            "bukan order reg": "Bukan Order Reg",
          }[(STATUS || "").trim().toLowerCase()] || "No Status";
        if (count[key] !== undefined) count[key]++;
      });
      return {
        ...po,
        items,
        ...count,
        Total: count.Lanjut + count.Cancel + count["Bukan Order Reg"],
      };
    });
  }, [data]);
}
