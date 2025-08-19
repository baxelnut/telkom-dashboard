// Style
import "./ActionTableHeader.css";
// Components
import Button from "../../components/ui/buttons/Button";
import Dropdown from "../../components/ui/input/Dropdown";
// Helpers
import { getExportOptions } from "../../helpers/exportHelpers";
import { ALERT_OPTIONS } from "../../helpers/tableHelper";

export default function ActionTableHeader({
  witel,
  witelOptions,
  selected,
  setSelected,
  handleViewFull,
  handleExport,
  po,
  status,
  period,
  bucketLabel,
  alertCounts = { aman: 0, segera: 0 },
}) {
  return (
    <div className="action-table-header">
      {!witel ? (
        <div className="filter-container">
          <h5>{bucketLabel}</h5>
          <div className="filter-items">
            <p>Select witel:</p>
            <Dropdown
              options={witelOptions}
              value={selected.witel}
              onChange={(e) =>
                setSelected((prev) => ({
                  ...prev,
                  witel: e.target.value,
                }))
              }
              short
              chevronDown
            />
          </div>
        </div>
      ) : (
        <div className="filter-container back-btn">
          <div className="filter-items">
            <Button text="Back" onClick={handleViewFull} arrowLeft short />
          </div>
          <div className="filter-items">
            <Button text="Export as" onClick={handleExport} short />
            <Dropdown
              options={getExportOptions()}
              value={selected.exportType}
              onChange={(e) =>
                setSelected((prev) => ({
                  ...prev,
                  exportType: e.target.value,
                }))
              }
              short
              chevronDown
            />
          </div>
        </div>
      )}

      {po && (
        <div className="title">
          <h6>
            {po} → {status} →{" "}
            {period === "ALL PERIOD" ? period : `${period} bulan`}
          </h6>

          {period == "<3" && (
            <h6 className="small-h">
              (Aman = {alertCounts.aman}; Segera Diproses = {alertCounts.segera}
              )
            </h6>
          )}
        </div>
      )}

      {period == "<3" && (
        <div className="filter-items sat">
          <p>See Filter:</p>
          <Dropdown
            options={ALERT_OPTIONS}
            value={selected.alertFilter}
            onChange={(e) =>
              setSelected((prev) => ({
                ...prev,
                alertFilter: e.target.value,
              }))
            }
            short
            chevronDown
          />
        </div>
      )}
    </div>
  );
}
