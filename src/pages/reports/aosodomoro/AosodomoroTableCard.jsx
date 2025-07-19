// Components
import AosodomoroTable from "../../../features/reports/aosodomoro/AosodomoroTable";
import Button from "../../../components/ui/buttons/Button";
import CardContent from "../../../components/ui/cards/CardContent";
import Dropdown from "../../../components/ui/input/Dropdown";
// Helpers
import { SEGMEN_OPS } from "../../../helpers/aosodomoroUtils";
import { getExportOptions } from "../../../helpers/exportTableData";

export default function AosodomoroTableCard({
  data,
  raw,
  loading,
  error,
  selectedSegmen,
  selectedSubtypes,
  selectedExport,
  onSegmenChange,
  onExportChange,
  onExport,
  onCellSelect,
  API_URL,
}) {
  return (
    <div className="card aosodomoro table">
      <div className="title">
        <h6>
          Report for {selectedSegmen === "ALL" ? "All Segmen" : selectedSegmen}
        </h6>
        <div className="stats">
          <p>
            Total raw data: <strong>{raw?.totalRawData ?? " ..."}</strong> rows
          </p>
          <p>
            Processed into: <strong>{raw?.totalProcessedData ?? " ..."}</strong>{" "}
            rows
          </p>
        </div>
      </div>

      <div className="filter-container">
        <div className="filter-items">
          <p>Segmen:</p>
          <Dropdown
            options={SEGMEN_OPS}
            value={selectedSegmen}
            onChange={(e) => onSegmenChange(e.target.value)}
            short
            chevronDown
          />
        </div>
        <div className="filter-items">
          <Button
            text="Export as"
            onClick={() => onExport(selectedExport)}
            short
          />
          <Dropdown
            options={getExportOptions()}
            value={selectedExport}
            onChange={(e) => onExportChange(e.target.value)}
            short
            chevronDown
          />
        </div>
      </div>

      <CardContent
        loading={loading}
        error={error}
        children={
          !selectedSubtypes.length ? (
            <div className="empty-state">
              <p className="small-p">
                Please select at least one order subtype.
              </p>
            </div>
          ) : (
            <AosodomoroTable
              tableData={data}
              selectedSegmen={selectedSegmen}
              selectedSubtypes={selectedSubtypes}
              onCellSelect={onCellSelect}
              API_URL={API_URL}
            />
          )
        }
      />
    </div>
  );
}
