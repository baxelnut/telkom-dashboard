import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

const TEMP_DIR = process.env.TEMP_DIR || "/tmp";
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

async function sendPhotoToTelegram({
  TELEGRAM_API,
  chatId,
  filePath,
  caption,
}) {
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("photo", fs.createReadStream(filePath));
  if (caption) {
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
  }
  await axios.post(`${TELEGRAM_API}/sendPhoto`, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  try {
    fs.unlinkSync(filePath);
  } catch (e) {}
}

async function captureTable({ url, selector, filename }) {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
    defaultViewport: { width: 1200, height: 800 },
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.goto(url, { waitUntil: "networkidle2" });
  try {
    await page.waitForSelector(selector, { timeout: 15000 });
  } catch (e) {
    await browser.close();
    return null;
  }
  const el = await page.$(selector);
  if (!el) {
    await browser.close();
    return null;
  }
  const filePath = path.join(TEMP_DIR, filename);
  await el.screenshot({ path: filePath });
  await browser.close();
  return filePath;
}

export default async function handleCaptureTables({ chatId, TELEGRAM_API }) {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "🚨 Capturing tables. Please wait...",
      parse_mode: "HTML",
    });

    const url = "https://rso2telkomdashboard.web.app/action-based";
    const aosPath = await captureTable({
      url,
      selector: ".aosodomoro-table",
      filename: `aosodomoro-${Date.now()}.png`,
    });
    const galaksiPath = await captureTable({
      url,
      selector: ".galaksi-table",
      filename: `galaksi-${Date.now()}.png`,
    });

    if (aosPath)
      await sendPhotoToTelegram({
        TELEGRAM_API,
        chatId,
        filePath: aosPath,
        caption: "📊 Aosodomoro Table",
      });
    if (galaksiPath)
      await sendPhotoToTelegram({
        TELEGRAM_API,
        chatId,
        filePath: galaksiPath,
        caption: "📊 Galaksi Table",
      });

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "✅ All tables processed (some may be missing).",
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error("[CAPTURE] error:", err?.message || err);
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId || process.env.TELEGRAM_CHAT_ID,
      text: "❌ Failed to capture tables. Please try again later.",
      parse_mode: "HTML",
    });
  }
}
