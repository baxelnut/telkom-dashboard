export const refreshGsheets = async ({ API_URL, setGsheetsStatus }) => {
  try {
    setGsheetsStatus?.("Please wait...");

    const resp = await fetch(`${API_URL}/gas/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meta: { triggeredBy: "frontend", timestamp: new Date().toISOString() },
      }),
    });

    const text = await resp.text();

    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      setGsheetsStatus?.("Unexpected response");
      console.error("Non-JSON response from /api/gas/push:", text);
      return;
    }

    if (!resp.ok || !data?.ok) {
      const errorMsg = data?.error || `HTTP ${resp.status}`;
      setGsheetsStatus?.("GSheets Error");
      console.error("GSheets error detail:", data);
      console.error("GSheets Error:", errorMsg);
      return;
    }

    setGsheetsStatus?.("Done!");
  } catch (err) {
    console.error("Fetch error", err);
    setGsheetsStatus?.("Failed to refresh");
  } finally {
    setTimeout(() => setGsheetsStatus?.(""), 10000);
    window.location.reload();
  }
};
