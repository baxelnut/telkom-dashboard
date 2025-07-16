import html2canvas from "html2canvas";

/**
 * Sends a screenshot of a table to Telegram with a custom message.
 * @param {object} options
 * @param {string} options.selector - CSS selector of the table container (e.g., ".aosodomoro-table")
 * @param {string} options.apiUrl - Backend base URL (e.g., "http://localhost:5000/api")
 * @param {string} options.target - "group" or "private"
 * @param {function} [options.setStatus] - Optional setter for UI feedback
 * @param {string} options.title - Message header/title
 * @param {string} options.subtext - Subtitle or description
 * @param {string} options.link - Dashboard/report link
 * @param {string} options.dateStr - Custom formatted date
 */
export async function sendTableToTelegram({
  selector,
  apiUrl,
  target = "group",
  setStatus,
  title,
  subtext,
  link,
  dateStr,
}) {
  if (setStatus) setStatus("📸 Capturing table...");

  const table = document.querySelector(selector);
  if (!table) {
    if (setStatus) setStatus("❌ Table not found.");
    console.error(`Table with selector "${selector}" not found.`);
    return;
  }

  try {
    const canvas = await html2canvas(table);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    const formData = new FormData();
    formData.append("photo", blob);
    formData.append("target", target);

    // Format the message
    const caption = `📊 *${title}*\n${dateStr}\n\n${subtext}\n\n🔗 ${link}`;

    formData.append("caption", caption);

    const res = await fetch(`${apiUrl}/telegram/photo`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    if (res.ok) {
      if (setStatus) setStatus("✅ Table sent to Telegram!");
      console.log("Telegram image sent:", json);
    } else {
      if (setStatus) setStatus("❌ Failed to send.");
      console.error("Telegram image error:", json);
    }
  } catch (err) {
    console.error("Telegram send error:", err);
    if (setStatus) setStatus("❌ Error while sending.");
  }
}
