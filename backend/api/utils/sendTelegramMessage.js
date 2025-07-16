import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_GROUP_CHAT_ID } =
  process.env;

export const sendTelegramMessage = async (text, target = "private") => {
  const chatId = target === "group" ? TELEGRAM_GROUP_CHAT_ID : TELEGRAM_CHAT_ID;

  console.log("========== TELEGRAM DEBUG ==========");
  console.log("💬 Sending to:", target);
  console.log("📨 Chat ID:", chatId);
  console.log("🔑 Bot Token:", TELEGRAM_BOT_TOKEN ? "✅ Loaded" : "❌ Missing");
  console.log("=====================================");

  if (!chatId) throw new Error("chat_id is empty or undefined");

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const res = await axios.post(url, {
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    });

    return res.data;
  } catch (error) {
    console.error("Telegram error:", error.response?.data || error.message);
    throw error;
  }
};
