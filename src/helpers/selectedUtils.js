export const formatCurrency = (v) =>
  v ? `Rp${v.toLocaleString("id-ID")}` : "Rp0";

export const getBucketKeys = (witelName, isTotal, kategoriUmur, subType) => {
  if (witelName === "ALL" && isTotal && subType == null) {
    return ["<3blnItems", ">3blnItems"];
  }
  if (isTotal && kategoriUmur === "both3bln") {
    return ["<3blnItems", ">3blnItems"];
  }
  return [`${kategoriUmur}Items`];
};

export const getFilteredItems = ({
  selectedData,
  witelName,
  isTotal,
  subType,
  subTypes,
  bucketKeys,
}) => {
  let items = [];
  if (witelName === "ALL") {
    if (subType) {
      selectedData.forEach((ent) =>
        bucketKeys.forEach((bk) => items.push(...(ent[subType]?.[bk] || [])))
      );
    } else {
      selectedData.forEach((ent) =>
        subTypes.forEach((st) =>
          bucketKeys.forEach((bk) => items.push(...(ent[st]?.[bk] || [])))
        )
      );
    }
  } else {
    const ent = selectedData.find((d) => d.witelName === witelName);
    if (!ent) return [];
    if (isTotal) {
      subTypes.forEach((st) =>
        bucketKeys.forEach((bk) => items.push(...(ent[st]?.[bk] || [])))
      );
    } else {
      items = ent[subType]?.[bucketKeys[0]] || [];
    }
  }
  return items;
};
