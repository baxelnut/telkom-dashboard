// sendReport.js
import dotenv from "dotenv";
dotenv.config();
import { sendScheduledReports } from "../api/utils/sendScheduledReports.js";

(async () => {
  console.log("🔥 Report run at:", new Date().toISOString());
  try {
    await sendScheduledReports();
    console.log("✅ Report finished.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Report failed:", err);
    process.exit(1);
  }
})();
