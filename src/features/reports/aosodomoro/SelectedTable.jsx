// Style
import "./SelectedTable.css";
// Helpers
import { renderSelectedTable } from "../../../helpers/selectedTableRenderers";
import {
  getBucketKeys,
  getFilteredItems,
} from "../../../helpers/selectedUtils";

export default function SelectedTable({
  selectedCell,
  selectedData,
  selectedSegmen,
}) {
  const { witelName, kategoriUmur, isTotal, extractedIds, subType, subTypes } =
    selectedCell;

  const bucketKeys = getBucketKeys(witelName, isTotal, kategoriUmur, subType);

  const allItems = getFilteredItems({
    selectedData,
    witelName,
    isTotal,
    subType,
    subTypes,
    bucketKeys,
  });

  const filtered = allItems.filter(
    (i) =>
      extractedIds.includes(i.UUID) &&
      (selectedSegmen === "ALL" || i.SEGMEN === selectedSegmen)
  );

  const hasInProgress = filtered.some((i) => i.KATEGORI === "IN PROCESS");

  return renderSelectedTable({ filtered, hasInProgress });
}
