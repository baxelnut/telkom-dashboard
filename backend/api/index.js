import express from "express";
import cors from "cors";
// Routes
import aosodomoroRoutes from "./routes/aosodomoro.js";
import regional3Routes from "./routes/regional.js";
import exportToSheet from "./routes/exportToSheet.js";
import galaksi from "./routes/galaksi.js";
import admin from "./routes/admin.js";
import telegramRoutes from "./routes/telegram.js";
import gasRoutes from "./routes/gas.js";
// Telegram webhook
import webhookHandler from "./telegram/webhook.js";

const PORT = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Routes
app.use("/api/aosodomoro", aosodomoroRoutes);
app.use("/api/regional-3", regional3Routes);
app.use("/api/export-to-sheet", exportToSheet);
app.use("/api/galaksi", galaksi);
app.use("/api/admin", admin);
app.use("/api/telegram", telegramRoutes);
app.use("/api/gas", gasRoutes);

// Telegram webhook
app.post("/api/telegram/webhook", webhookHandler);

// Only listen if NOT in Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app; // Vercel export
