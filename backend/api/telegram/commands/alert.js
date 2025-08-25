import axios from "axios";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const TEMP_DIR = path.resolve("./temp-screenshots");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

export default async function handleAlert({ chatId, TELEGRAM_API }) {
  try {
    console.log("[ALERT] Starting alert sequence...");

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "🚨 Preparing alert list. Please wait...",
      parse_mode: "HTML",
    });

    // Fetch data
    const resp = await axios.get(
      `${process.env.API_BASE_URL}/api/regional-3/report/alert`
    );
    const rows = resp?.data || [];
    console.log("[ALERT] rows fetched:", rows.length);

    if (!Array.isArray(rows) || rows.length === 0) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "✅ Tidak ada order yang perlu diingatkan saat ini.",
        parse_mode: "HTML",
      });
      return;
    }

    // Textual summary
    const parts = rows.map((g) => {
      const statuses = g.statuses || {};
      const statusSummary = Object.entries(statuses)
        .map(([status, count]) => `${status}: ${count}`)
        .join(" | ");
      const pic = g.pic || "UNKNOWN";
      const witel = g.witel || "-";
      const total =
        typeof g.total === "number"
          ? g.total
          : Object.values(statuses).reduce((s, v) => s + Number(v || 0), 0);
      return `🙎 ${pic} – ${witel}\n${statusSummary} | Total: ${total}`;
    });

    const now = new Date().toISOString().slice(0, 10);

    const textMsg =
      `📢 <b>Pemberitahuan Potensi Order &gt; 3 Bulan</b>\n\n` +
      `Berikut daftar order yang hampir melewati 3 bulan:\n\n` +
      parts.join("\n\n") +
      `\n\n⚠️ <i>Mohon segera dilakukan follow-up sebelum melewati batas waktu</i> ⚠️\n\n` +
      `Waktu Update: ${now}\n\n` +
      `🔗 https://rso2telkomdashboard.web.app/action-based`;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: textMsg,
      parse_mode: "HTML",
    });
    console.log("[ALERT] Textual summary sent.");

    // Puppeteer helper to generate screenshot
    async function captureTable(url, selector, filename) {
      console.log(`[ALERT] Capturing table from ${url} (${selector})`);
      const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2" });
      await page
        .waitForSelector(selector, { timeout: 5000 })
        .catch(() => console.log("[ALERT] Table not found:", selector));
      const element = await page.$(selector);
      if (!element) {
        console.log("[ALERT] Failed to find table:", selector);
        await browser.close();
        return null;
      }
      const filepath = path.join(TEMP_DIR, filename);
      await element.screenshot({ path: filepath });
      await browser.close();
      console.log("[ALERT] Screenshot saved:", filepath);
      return filepath;
    }

    // Generate screenshots for Aosodomoro & Galaksi
    const aosPath = await captureTable(
      "https://rso2telkomdashboard.web.app/action-based",
      ".aosodomoro-table",
      "aosodomoro.png"
    );
    const galaksiPath = await captureTable(
      "https://rso2telkomdashboard.web.app/action-based",
      ".galaksi-table",
      "galaksi.png"
    );

    // Send screenshot to Telegram
    async function sendPhoto(filepath, caption) {
      if (!filepath) return;
      const form = new FormData();
      form.append("chat_id", chatId);
      form.append("photo", fs.createReadStream(filepath));
      if (caption) {
        form.append("caption", caption);
        form.append("parse_mode", "HTML");
      }

      await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
        form,
        {
          headers: form.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );
      console.log("[ALERT] Photo sent:", filepath);
    }

    await sendPhoto(aosPath, "📊 Tabel Aosodomoro");
    await sendPhoto(galaksiPath, "📊 Tabel Galaksi");

    console.log("[ALERT] All outputs sent.");
  } catch (err) {
    console.error("[ALERT] Error", err?.response?.data || err?.message || err);
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "Failed to fetch alerts. Please try again.",
        parse_mode: "HTML",
      });
    } catch (sendErr) {
      console.error("[ALERT] Fallback send error", sendErr?.message || sendErr);
    }
  }
}
