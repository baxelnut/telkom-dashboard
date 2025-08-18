import express from "express";
import cors from "cors";

import aosodomoroRoutes from "./routes/aosodomoro.js";
import regional3Routes from "./routes/regional.js";
import exportToSheet from "./routes/exportToSheet.js";
import galaksi from "./routes/galaksi.js";
import admin from "./routes/admin.js";
import telegramRoutes from "./routes/telegram.js";
import gasRoutes from "./routes/gas.js";

import { startBot } from "./bot/bot.js";

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.use("/api/aosodomoro", aosodomoroRoutes);
app.use("/api/regional-3", regional3Routes);
app.use("/api/export-to-sheet", exportToSheet);
app.use("/api/galaksi", galaksi);
app.use("/api/admin", admin);
app.use("/api/telegram", telegramRoutes);
app.use("/api/gas", gasRoutes);

// start polling locally only
(async () => {
  try {
    await startBot();
  } catch (err) {
    console.error("❌ Bot setup failed:", err);
  }
})();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
