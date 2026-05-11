export async function sendAlertToTelegram({ API_URL, setStatus }) {
  if (setStatus) setStatus("Please wait...");
  try {
    const res = await fetch(`${API_URL}/telegram/alert`, { method: "POST" });
    const json = await res.json();
    if (res.ok) {
      if (setStatus) setStatus("Sent!");
      console.error("Alert sent:", json);
    } else {
      if (setStatus) setStatus("Failed.");
      console.error("Alert send error:", json);
    }
  } catch (err) {
    console.error("Alert send error:", err);
    if (setStatus) setStatus("Error.");
  }
}
