import axios from "axios";

const API_BASE = process.env.API_BASE_URL || "http://localhost:5000";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  // parse body if needed
  let update = req.body;
  try {
    if (typeof update === "string") update = JSON.parse(update);
  } catch (e) {
    console.warn("webhook: failed to parse body as JSON", e);
    // still return OK to avoid Telegram retries, but log in Vercel
    return res.status(200).send("OK");
  }

  // respond immediately so Telegram doesn't wait
  res.status(200).send("OK");

  // process asynchronously (fire-and-forget)
  (async () => {
    try {
      // only forward /start updates
      const text = update?.message?.text || "";
      const from = update?.message?.from || {};
      const chat = update?.message?.chat || {};

      // Forward to your backend endpoint that implements the logic
      // Example endpoint: POST /api/telegram/handle-start
      if (text && text.trim() === "/start") {
        await axios.post(
          `${API_BASE}/api/telegram/handle-start`,
          {
            update,
            chatId: chat.id,
            username: from.username,
            telegramId: from.id,
          },
          {
            timeout: 30000,
          }
        );
      } else {
        await axios
          .post(
            `${API_BASE}/api/telegram/handle-generic`,
            {
              update,
            },
            { timeout: 10000 }
          )
          .catch(() => {});
      }
    } catch (err) {
      console.error(
        "webhook -> backend forwarding error:",
        err?.response?.data || err?.message || err
      );
    }
  })();
}
