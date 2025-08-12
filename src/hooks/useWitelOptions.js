import { useMemo } from "react";

export default function useWitelOptions(data) {
  return useMemo(() => {
    if (!data?.po) return [];
    const unique = [...new Set(data.po.map((r) => r.WITEL).filter(Boolean))];
    return [
      { value: "ALL", label: "ALL" },
      ...unique.map((w) => ({ value: w, label: w })),
    ];
  }, [data]);
}
