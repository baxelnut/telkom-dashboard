import React from "react";
import "./ActionTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

export default function ActionTable({
  reportTableData,
  selectedCategory,
  orderSubtypes,
  loading,
  error,
  onCellSelect,
}) {
  if (loading) {
    return <Loading backgroundColor="transparent" />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return <div className="action-table">
    a
  </div>;
}
