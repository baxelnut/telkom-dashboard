import axios from "axios";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const body =
    req.body && typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const update = body?.update || {};
  const text = update?.message?.text?.trim() || "";
  const chatId = update?.message?.chat?.id;

  if (!chatId) return res.status(400).json({ error: "Missing chatId" });

  let reply = null;

  if (text === "/report") {
    reply = "📊 This is report command output.";
  } else if (text === "/alerts") {
    reply = "🔔 This is alerts command output.";
  }

  if (reply) {
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: reply,
      });
    } catch (err) {
      console.error("handle-generic sendMessage error:", err?.message || err);
    }
  }

  return res.status(200).json({ ok: true });
}
