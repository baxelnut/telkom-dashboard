import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import { sendScheduledReports } from "../api/utils/sendScheduledReports.js";

const now = new Date();
const timestamp = now.toISOString();
const dateKey = timestamp.split("T")[0];

const LOG_PATH = path.resolve("logs/last-run.json");
const LOG_DIR = path.dirname(LOG_PATH);

// Create dir if needed
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Check for duplicate run
if (fs.existsSync(LOG_PATH)) {
  const lastRun = JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
  if (lastRun.date === dateKey) {
    console.log("⏹️ Report already sent today. Skipping.");
    process.exit(0);
  }
}

// ✅ PRE-WRITE to prevent race condition
fs.writeFileSync(LOG_PATH, JSON.stringify({ date: dateKey }));

(async () => {
  try {
    console.log("🔥 Scheduled report running at:", timestamp);
    await sendScheduledReports();
    console.log("✅ Report sent.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to send report:", err);
    process.exit(1);
  }
})();
