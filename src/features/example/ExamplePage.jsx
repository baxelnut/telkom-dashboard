import { useState, useEffect } from "react";
import "./ExamplePage.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

export default function ExamplePage({ API_URL }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [hello, setHello] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const responses = await Promise.allSettled([
          fetch(`${API_URL}/aosodomoro`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch aosodomoro data");
            return res.json();
          }),
          fetch(`${API_URL}/hello`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch hello data");
            return res.json();
          }),
          fetch(`${API_URL}/regional_3/progress_status`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch progress data");
            return res.json();
          }),
        ]);

        const [aosodomoroResult, helloResult, statusResult] = responses;

        if (aosodomoroResult.status === "rejected") {
          throw new Error("Backend failed to fetch aosodomoro data.");
        }
        if (helloResult.status === "rejected") {
          throw new Error("Backend failed to fetch hello data.");
        }
        // if (statusResult.status === "rejected") {
        //   throw new Error("Backend failed to fetch progress data.");
        // }

        setData(aosodomoroResult.value);
        setHello(helloResult.value);
        setStatusData(statusResult.value.data);
      } catch (error) {
        console.error("🚨 API Fetch Error:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = async () => {
    if (!statusData || !Array.isArray(statusData)) {
      return alert("No data to export");
    }

    setExporting(true);
    try {
      // Convert the object data to array format for the sheet
      const formattedData = [
        ["Witel", "Lanjut", "Cancel", "Bukan Order Reg", "No Status", "Total"],
        ...statusData.map((item) => [
          item.bill_witel,
          item.lanjut,
          item.cancel,
          item.bukan_order_reg,
          item.no_status,
          item.lanjut + item.cancel + item.bukan_order_reg + item.no_status,
        ]),
      ];

      const res = await fetch(`${API_URL}/export_to_sheet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: formattedData,
          sheetName: "Example",
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Exported to Google Sheet 🧾✅");
      } else {
        throw new Error(result.error || "Export failed");
      }
    } catch (err) {
      alert(`❌ Export failed: ${err.message}`);
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="example-container">
      <h1>ExamplePage</h1>

      <div className="example-items">
        <button
          onClick={handleExport}
          disabled={exporting || !statusData}
          className="export-btn"
        >
          {exporting
            ? "Exporting..."
            : "Export 'in progress' → Google Sheet 🧾"}
        </button>
      </div>

      <div className="example-items">
        <h6>trynna fetch helloResponse from `${API_URL}/hello`</h6>
        <div className="example-content">
          {loading ? (
            <Loading />
          ) : error ? (
            <Error message={error} />
          ) : (
            <pre>{JSON.stringify(hello, null, 2)}</pre>
          )}
        </div>
      </div>

      <div className="example-items">
        <h6>
          trynna fetch statusData from `${API_URL}
          /regional_3/progress_status`
        </h6>
        <div className="example-content">
          {loading ? (
            <Loading />
          ) : error ? (
            <Error message={error} />
          ) : (
            <p>{JSON.stringify(statusData, null, 2)}</p>
          )}
        </div>
      </div>

      {/* <div className="example-items">
        <h6>trynna fetch aosodomoroResponse from `${API_URL}/aosodomoro`</h6>
        <div className="example-content">
          {loading ? (
            <Loading />
          ) : error ? (
            <Error message={error} />
          ) : (
            <p>{JSON.stringify(data, null, 2)}</p>
          )}
        </div>
      </div> */}

      <div className="example-items">
        <h6>dynamic universal component display</h6>
        <div className="component-display-container">
          <div className="component-display">
            <p>for loading:</p>
            <Loading />
          </div>
          <div className="component-display">
            <p>for error:</p>
            <Error />
          </div>
        </div>
      </div>
    </div>
  );
}
