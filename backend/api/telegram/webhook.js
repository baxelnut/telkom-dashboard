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
          text: "❌ No linked account found.\n➡️ Go to Dashboard → Settings → Connect Telegram",
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
        text: `👋 Welcome ${user.fullName || "User"}! You are linked as: ${
          user.role || "user"
        } \nHere are your available commands:\n/report - Get latest orders\n/alert - Manage alerts`,
      });

      return;
    }

    if (text === "/report") {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "📊 Report output here...",
      });
      return;
    }

    // NEW: handle /alert and /alerts
    if (text === "/alert" || text === "/alerts") {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "🔔 Alert management coming soon...\n(You can hook this to your DB logic)",
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
