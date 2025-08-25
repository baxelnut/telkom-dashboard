import html2canvas from "html2canvas";

/**
 * Sends a screenshot of a table to Telegram with a custom message.
 * @param {object} options
 * @param {string} options.selector - CSS selector of the table container (e.g., ".aosodomoro-table")
 * @param {string} options.API_URL - Backend base URL (e.g., "http://localhost:5000/api")
 * @param {string} options.target - "group" or "private"
 * @param {function} [options.setTeleStatus] - Optional setter for UI feedback
 * @param {string} options.title - Message header/title
 * @param {string} options.subtext - Subtitle or description
 * @param {string} options.link - Dashboard/report link
 * @param {string} options.dateStr - Custom formatted date
 */
export async function sendTableToTelegram({
  selector,
  API_URL,
  target = "group",
  chatId, // override destination (string or number)
  setTeleStatus,
  title,
  subtext,
  link,
  dateStr,
  parseMode = "Markdown", // default parse mode for caption
}) {
  if (setTeleStatus) setTeleStatus("Please wait...");

  const table = document.querySelector(selector);
  if (!table) {
    if (setTeleStatus) setTeleStatus("Table not found.");
    console.error(`Table with selector "${selector}" not found.`);
    return { ok: false, error: "Table not found" };
  }

  try {
    const canvas = await html2canvas(table); // capture
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    if (!blob) {
      if (setTeleStatus) setTeleStatus("Failed to capture table.");
      console.error("html2canvas returned null blob");
      return { ok: false, error: "Failed to capture table" };
    }

    const formData = new FormData();
    formData.append("photo", blob, "table.png");
    formData.append("target", target);

    // include chatId override to force private message
    if (chatId) {
      formData.append("chatId", String(chatId)); // ensure it's a string
    }

    // build caption
    const captionLines = [];
    if (title) captionLines.push(`*${title}*`);
    if (dateStr) captionLines.push(`${dateStr}`);
    if (subtext) captionLines.push(`\n${subtext}`);
    if (link) captionLines.push(`\n${link}`);
    const caption = captionLines.join("\n");

    if (caption) {
      formData.append("caption", caption);
      formData.append("parse_mode", parseMode);
    }

    const res = await fetch(`${API_URL.replace(/\/$/, "")}/telegram/photo`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      if (setTeleStatus) setTeleStatus("Failed to send.");
      console.error("Telegram image error:", json);
      return { ok: false, error: json };
    }

    if (setTeleStatus) setTeleStatus("Sent!");
    return { ok: true, result: json };
  } catch (err) {
    console.error("Telegram send error:", err);
    if (setTeleStatus) setTeleStatus("Error while sending.");
    return { ok: false, error: err };
  }
}
