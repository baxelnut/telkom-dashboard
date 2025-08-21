import admin from "../firebaseAdmin.js";
import axios from "axios";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TELEGRAM_TOKEN) {
  console.error("Missing TELEGRAM_BOT_TOKEN");
}

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK"); // allow simple checks

  const body =
    req.body && typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { chatId, username, telegramId, update } = body || {};

  // Basic validation
  if (!chatId) {
    return res.status(400).json({ error: "Missing chatId" });
  }

  try {
    // Lookup user in Firestore by telegramId OR username (adjust to your schema)
    const db = admin.firestore();
    let userDoc = null;

    if (telegramId) {
      const snap = await db
        .collection("users")
        .where("telegramId", "==", String(telegramId))
        .limit(1)
        .get();
      if (!snap.empty) userDoc = snap.docs[0];
    }

    if (!userDoc) {
      // Send a reply back to user that they're not registered
      const text = `❌ No linked account found for this Telegram account.\n➡️ Please go to Dashboard → Settings → Connect Telegram and set your username or telegramId.`;
      await axios
        .post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        })
        .catch((err) =>
          console.warn(
            "sendMessage error:",
            err?.response?.data || err?.message || err
          )
        );
      return res.status(200).json({ ok: true, message: "not-registered" });
    }

    const user = userDoc.data();

    // Optionally update teleChatId in user doc so you can push messages later
    try {
      await db
        .collection("users")
        .doc(userDoc.id)
        .update({ teleChatId: chatId });
    } catch (e) {
      console.warn("Failed to update teleChatId", e?.message || e);
    }

    // Build reply text (customize)
    const reply1 = `👋 Welcome ${user.fullName || "User"}! You are linked as: ${
      user.role || "user"
    }`;
    const reply2 =
      "Here are your available commands:\n/report - Get latest orders\n/alerts - Manage alerts";

    // Send replies via Telegram Bot API
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: reply1,
    });
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: reply2,
    });

    return res.status(200).json({ ok: true, status: "sent" });
  } catch (err) {
    console.error(
      "handle-start error:",
      err?.response?.data || err?.message || err
    );
    // don't fail the webhook; return 500 for debug but Telegram already got 200 earlier
    return res.status(500).json({ error: "internal" });
  }
}
