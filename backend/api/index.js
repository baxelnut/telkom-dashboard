import express from "express";
import cors from "cors";
import cron from "node-cron";
import { sendScheduledReports } from "./utils/sendScheduledReports.js";

import aosodomoroRoutes from "./routes/aosodomoro.js";
import regional3Routes from "./routes/regional.js";
import exportToSheet from "./routes/exportToSheet.js";
import galaksi from "./routes/galaksi.js";
import admin from "./routes/admin.js";
import telegramRoutes from "./routes/telegram.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const PORT = process.env.PORT || 5000;

// Routes
app.use("/api/aosodomoro", aosodomoroRoutes);
app.use("/api/regional-3", regional3Routes);
app.use("/api/export-to-sheet", exportToSheet);
app.use("/api/galaksi", galaksi);
app.use("/api/admin", admin);
app.use("/api/telegram", telegramRoutes);

// 🕒 Production-ready scheduler: Mon & Fri at 1 PM
// cron.schedule("0 13 * * 1,5", () => {
//   console.log("⏰ Scheduled report triggered (Mon/Fri 13:00)");
//   sendScheduledReports();
// });

// Schedule the report sending job every minute (for debugging)
// cron.schedule("* * * * *", () => {
//   console.log("⏰ Triggering scheduled report job...");
//   sendScheduledReports();
// });

app.get("/api/manual-send-report", async (req, res) => {
  try {
    await sendScheduledReports();
    res.status(200).json({ message: "✅ Report triggered successfully" });
  } catch (err) {
    console.error("❌ Manual report trigger failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
