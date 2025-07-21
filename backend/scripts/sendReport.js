// scripts/sendReport.js
import dotenv from "dotenv";
dotenv.config();

import { sendScheduledReports } from "../api/utils/sendScheduledReports.js";

(async () => {
  try {
    await sendScheduledReports();
    console.log("✅ Report sent.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to send report:", err);
    process.exit(1);
  }
})();
