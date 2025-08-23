import { db } from "../firebaseAdmin.js";
import axios from "axios";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// in-memory dedupe for retries within the same instance
const seen = new Set();
const SEEN_LIMIT = 500;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const update = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  // Ack ASAP so Telegram won't retry
  res.status(200).send("OK");

  try {
    const updateId = update?.update_id;
    const msg = update?.message;
    const text = msg?.text?.trim();
    const chatId = msg?.chat?.id;
    const telegramId = msg?.from?.id;
    console.log(
      "DEBUG telegramId:",
      telegramId,
      "chatId:",
      chatId,
      "text:",
      text
    );
    if (!chatId || !text) return;

    // Idempotency: skip duplicates (Telegram retries / multi-hits)
    if (updateId != null) {
      if (seen.has(updateId)) return;
      seen.add(updateId);
      if (seen.size > SEEN_LIMIT) {
        // keep memory bounded
        const first = seen.values().next().value;
        seen.delete(first);
      }
    }

    // UX: typing…
    await axios
      .post(`${TELEGRAM_API}/sendChatAction`, {
        chat_id: chatId,
        action: "typing",
      })
      .catch(() => {});

    if (text === "/start") {
      const snap = await db
        .collection("users")
        .where("telegramId", "==", String(telegramId))
        .limit(1)
        .get();

      if (snap.empty) {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: "No linked account found.\nGo to Dashboard → Connect Telegram",
        });
        return;
      }

      const userDoc = snap.docs[0];
      const user = userDoc.data();

      await db
        .collection("users")
        .doc(userDoc.id)
        .update({ teleChatId: chatId })
        .catch(() => {});

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `👋 Welcome ${
          user.fullName || "User"
        }!\nHere are your available commands:\n/report - Get latest orders\n/alert - Manage alerts`,
      });

      return;
    }

    if (text === "/report") {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "Preparing your report, please wait...",
      });

      try {
        // call your backend endpoint using API_BASE (set in env)
        const resp = await axios.get(
          `${process.env.API_BASE_URL}/api/regional-3/report/by-telegram`,
          {
            params: { telegramId: String(telegramId) }, // force string
          }
        );

        const body = resp.data;
        if (!body || body.matchCount === 0) {
          await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: "No reports found for your account.",
          });
          return;
        }

        // craft a compact summary message
        const s = body.summary;
        const textMsg =
          `Report for ${body.poName || body.fallbackName || "You"}\n\n` +
          `Total orders: ${s.totalOrders}\n` +
          `Total revenue: ${s.totalRevenue}\n` +
          `IN PROCESS: ${s.byKategori["IN PROCESS"] || 0}\n` +
          `<3 months: ${s.byAge["<3bln"].count} orders` +
          `>3 months: ${s.byAge[">3bln"].count} orders` +
          `Visit dashboard to view items.`;

        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: textMsg,
        });
      } catch (err) {
        console.error(
          "REPORT -> error",
          err?.response?.data || err?.message || err
        );
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: "Failed to build your report. Try again later.",
        });
      }

      return;
    }

    if (text === "/alert") {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "🔔 Alert management coming soon...",
      });
      return;
    }

    // Fallback for unknown commands
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Unknown command. Try /report or /alert",
    });
  } catch (err) {
    console.error("Webhook error:", err?.response?.data || err.message || err);
  }
}
