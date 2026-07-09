import { useMemo } from "react";

export default function useFilteredReport(data, detailed) {
  const [witel, po, period, status] = detailed;

  return useMemo(() => {
    if (!data?.report) return [];
    return data.report
      .filter((r) => witel === "ALL" || r.witelName === witel)
      .map((r) => {
        let items = [];
        const inProc = r["IN PROCESS"] || {};
        if (period === "<2") items = inProc["<2blnItems"] || [];
        else if (period === ">2") items = inProc[">2blnItems"] || [];
        else
          items = [
            ...(inProc["<2blnItems"] || []),
            ...(inProc[">2blnItems"] || []),
          ];
        if (po && po !== "ALL PO") items = items.filter((i) => i.PIC === po);
        if (status && status !== "ALL STATUS") {
          items = items.filter((i) =>
            status === "No Status"
              ? !i.STATUS || i.STATUS.trim() === ""
              : i.STATUS?.trim() === status,
          );
        }
        return items.length ? { witelName: r.witelName, items } : null;
      })
      .filter(Boolean);
  }, [data, witel, po, period, status]);
}
