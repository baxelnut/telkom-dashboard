import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import handleAlert from "../api/telegram/commands/alert.js";
import { sendScheduledReports } from "../api/utils/sendScheduledReports.js";

(async () => {
  console.log("🔥 Report run at:", new Date().toISOString());

  // collect all secrets here (single source of truth)
  const config = {
    API_BASE_URL: process.env.API_BASE_URL,
    BASE_URL: "https://rso2telkomdashboard.web.app",
    TELKOM_DASHBOARD_EMAIL: process.env.TELKOM_DASHBOARD_EMAIL,
    TELKOM_DASHBOARD_PASSWORD: process.env.TELKOM_DASHBOARD_PASSWORD,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    TELEGRAM_GROUP_CHAT_ID: process.env.TELEGRAM_GROUP_CHAT_ID,
    TELEGRAM_CHANNEL_CHAT_ID: process.env.TELEGRAM_CHANNEL_CHAT_ID,
  };

  try {
    try {
      await sendScheduledReports(config); // pass env to util
    } catch (e) {
      console.error("❌ Scheduled reports failed:", e.message);
    }

    try {
      await handleAlert({
        axios,
        chatId: config.TELEGRAM_GROUP_CHAT_ID, // CHANGE LATER
        TELEGRAM_API: `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}`,
      });
    } catch (err) {
      console.error("❌ handleAlert failed:", err.message);
    }

    console.log("✅ Report finished.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Report failed:", err);
    process.exit(1);
  }
})();
