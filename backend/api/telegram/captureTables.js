import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

const TEMP_DIR = path.resolve("./temp-screenshots");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

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

  console.log(`[CAPTURE] Photo sent: ${filePath}`);

  // delete local file after sending
  try {
    fs.unlinkSync(filePath);
    console.log(`[CAPTURE] Photo deleted: ${filePath}`);
  } catch (err) {
    console.warn(`[CAPTURE] Failed to delete file: ${filePath}`, err);
  }
}

async function captureTable({ url, selector, filename }) {
  console.log(`[CAPTURE] Opening ${url} to capture "${selector}"`);
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const element = await page.$(selector);
  if (!element) {
    console.warn(`[CAPTURE] Table not found: ${selector}`);
    await browser.close();
    return null;
  }

  const filePath = path.join(TEMP_DIR, filename);
  await element.screenshot({ path: filePath });
  await browser.close();
  console.log(`[CAPTURE] Screenshot saved: ${filePath}`);
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

    // Capture Aosodomoro table
    const aosPath = await captureTable({
      url,
      selector: ".aosodomoro-table",
      filename: "aosodomoro.png",
    });

    // Capture Galaksi table
    const galaksiPath = await captureTable({
      url,
      selector: ".galaksi-table",
      filename: "galaksi.png",
    });

    // Send screenshots
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
      text: "✅ All tables sent!",
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error(
      "[CAPTURE] Error capturing/sending tables",
      err?.response?.data || err?.message || err
    );
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id,
      text: "❌ Failed to capture tables. Please try again later.",
      parse_mode: "HTML",
    });
  }
}
