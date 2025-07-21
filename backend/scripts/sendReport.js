// scripts/sendReport.js
import dotenv from "dotenv";
dotenv.config();

import { sendScheduledReports } from "../api/utils/sendScheduledReports.js";

(async () => {
  try {
    console.log("🔥 Scheduled report running at:", new Date().toISOString());
    await sendScheduledReports();
    console.log("✅ Report sent.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to send report:", err);
    process.exit(1);
  }
})();
