// Style
import "./AosodomoroTableBody.css";
// Helpers
import {
  renderRowCells,
  renderWitelTotalCells,
  renderReportCells,
  renderGrandTotals,
} from "./aosodomoroRenderers";

const OrderTypeBlock = ({
  orderType,
  tableData,
  selectedSubtypes,
  selectedSegmen,
  handleCellClick,
}) => (
  <>
    <tr className="aosodomoro-row">
      <td className="unresponsive">
        <strong>{orderType}</strong>
      </td>
      {renderReportCells(
        "<",
        orderType,
        tableData,
        selectedSubtypes,
        selectedSegmen,
        handleCellClick
      )}
      {renderGrandTotals(
        "<",
        orderType,
        tableData,
        selectedSubtypes,
        selectedSegmen,
        handleCellClick
      )}
      {renderReportCells(
        ">",
        orderType,
        tableData,
        selectedSubtypes,
        selectedSegmen,
        handleCellClick
      )}
      {renderGrandTotals(
        ">",
        orderType,
        tableData,
        selectedSubtypes,
        selectedSegmen,
        handleCellClick
      )}
      {renderGrandTotals(
        "both",
        orderType,
        tableData,
        selectedSubtypes,
        selectedSegmen,
        handleCellClick
      )}
    </tr>

    {tableData.map((entry, index) => (
      <tr key={entry.witelName || `WITEL_NA_${index}`}>
        <td className="unresponsive">
          <strong>
            {!entry.witelName || entry.witelName === "null"
              ? "N/A"
              : entry.witelName}
          </strong>
        </td>
        {renderRowCells(
          entry,
          "<",
          orderType,
          selectedSubtypes,
          selectedSegmen,
          handleCellClick
        )}
        {renderWitelTotalCells(
          entry,
          "<",
          orderType,
          selectedSubtypes,
          selectedSegmen,
          handleCellClick
        )}
        {renderRowCells(
          entry,
          ">",
          orderType,
          selectedSubtypes,
          selectedSegmen,
          handleCellClick
        )}
        {renderWitelTotalCells(
          entry,
          ">",
          orderType,
          selectedSubtypes,
          selectedSegmen,
          handleCellClick
        )}
        {renderWitelTotalCells(
          entry,
          "both",
          orderType,
          selectedSubtypes,
          selectedSegmen,
          handleCellClick
        )}
      </tr>
    ))}
  </>
);

const GrandTotalRow = ({
  tableData,
  selectedSubtypes,
  selectedSegmen,
  handleCellClick,
}) => (
  <tr className="grand-total-row">
    <td className="unresponsive">
      <strong>GRAND TOTAL</strong>
    </td>
    {renderReportCells(
      "<",
      "ALL",
      tableData,
      selectedSubtypes,
      selectedSegmen,
      handleCellClick
    )}
    {renderGrandTotals(
      "<",
      "ALL",
      tableData,
      selectedSubtypes,
      selectedSegmen,
      handleCellClick
    )}
    {renderReportCells(
      ">",
      "ALL",
      tableData,
      selectedSubtypes,
      selectedSegmen,
      handleCellClick
    )}
    {renderGrandTotals(
      ">",
      "ALL",
      tableData,
      selectedSubtypes,
      selectedSegmen,
      handleCellClick
    )}
    {renderGrandTotals(
      "both",
      "ALL",
      tableData,
      selectedSubtypes,
      selectedSegmen,
      handleCellClick
    )}
  </tr>
);

export const AosodomoroTableBody = ({
  tableData,
  selectedSegmen,
  selectedSubtypes,
  handleCellClick,
}) => (
  <tbody>
    {["AO", "SO", "DO", "MO", "RO"].map((orderType) => (
      <OrderTypeBlock
        key={orderType}
        orderType={orderType}
        tableData={tableData}
        selectedSubtypes={selectedSubtypes}
        selectedSegmen={selectedSegmen}
        handleCellClick={handleCellClick}
      />
    ))}
    <GrandTotalRow
      tableData={tableData}
      selectedSubtypes={selectedSubtypes}
      selectedSegmen={selectedSegmen}
      handleCellClick={handleCellClick}
    />
  </tbody>
);
