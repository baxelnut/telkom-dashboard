// backend/api/telegram/captureTables.js
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { fileURLToPath } from "url";

const TEMP_DIR = process.env.TEMP_DIR || "/tmp";
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Try common chromium paths used by different distros
const COMMON_CHROMIUM_PATHS = [
  process.env.CHROMIUM_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome-stable",
  "/snap/bin/chromium",
].filter(Boolean);

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
  } catch (e) {
    console.warn("[CAPTURE] failed to unlink file", filePath, e?.message || e);
  }
}

async function tryLaunchSystemChromium() {
  try {
    const puppeteerCore = (await import("puppeteer-core")).default;

    for (const p of COMMON_CHROMIUM_PATHS) {
      if (!p) continue;
      try {
        if (fs.existsSync(p)) {
          console.log(`[CAPTURE] Found system chromium at ${p}`);
          const browser = await puppeteerCore.launch({
            executablePath: p,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
            ],
            headless: true,
            defaultViewport: { width: 1200, height: 800 },
          });
          return browser;
        }
      } catch (err) {
        console.warn(
          `[CAPTURE] failed to launch chromium at ${p}:`,
          err?.message || err
        );
      }
    }

    console.log("[CAPTURE] no system chromium found in common paths");
    return null;
  } catch (err) {
    console.log(
      "[CAPTURE] puppeteer-core not available or launch failed:",
      err?.message || err
    );
    return null;
  }
}

async function tryLaunchBundledPuppeteer() {
  try {
    const puppeteer = (await import("puppeteer")).default;
    console.log(
      "[CAPTURE] trying bundled puppeteer (may download Chromium at install time)"
    );
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      headless: true,
      defaultViewport: { width: 1200, height: 800 },
    });
    return browser;
  } catch (err) {
    console.log("[CAPTURE] puppeteer launch failed:", err?.message || err);
    return null;
  }
}

async function getBrowserInstance() {
  // Try system chromium via puppeteer-core first
  let browser = await tryLaunchSystemChromium();
  if (browser) return browser;

  // Fallback to bundled puppeteer
  browser = await tryLaunchBundledPuppeteer();
  if (browser) return browser;

  throw new Error(
    "No available Chromium launcher (system chromium or puppeteer)."
  );
}

async function captureTable({ url, selector, filename }) {
  console.log(`[CAPTURE] Opening ${url} to capture "${selector}"`);
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    try {
      await page.waitForSelector(selector, { timeout: 15000 });
    } catch (waitErr) {
      console.warn(`[CAPTURE] waitForSelector timed out for ${selector}`);
      await page.close();
      await browser.close();
      return null;
    }

    const element = await page.$(selector);
    if (!element) {
      console.warn(`[CAPTURE] Table not found: ${selector}`);
      await page.close();
      await browser.close();
      return null;
    }

    const filePath = path.join(TEMP_DIR, filename);
    await element.screenshot({ path: filePath });
    await page.close();
    await browser.close();
    return filePath;
  } catch (err) {
    try {
      await page.close();
    } catch (_) {}
    try {
      await browser.close();
    } catch (_) {}
    throw err;
  }
}

export default async function handleCaptureTables({ chatId, TELEGRAM_API }) {
  try {
    console.log("[CAPTURE] start: sending 'capturing' message to user");
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "🚨 Capturing tables. Please wait...",
      parse_mode: "HTML",
    });

    // Define tables with their page + selector
    const tables = [
      {
        name: "Aosodomoro",
        url: "https://rso2telkomdashboard.web.app/reports/aosodomoro",
        selector: ".aosodomoro-table",
      },
      {
        name: "Galaksi",
        url: "https://rso2telkomdashboard.web.app/reports/galaksi",
        selector: ".galaksi-table",
      },
    ];

    // Loop through and capture each
    for (const t of tables) {
      const filePath = await captureTable({
        url: t.url,
        selector: t.selector,
        filename: `${t.name.toLowerCase()}-${Date.now()}.png`,
      });

      if (filePath) {
        await sendPhotoToTelegram({
          TELEGRAM_API,
          chatId,
          filePath,
          caption: `📊 ${t.name} Table`,
        });
      } else {
        console.warn(`[CAPTURE] ${t.name} table screenshot not produced`);
      }
    }

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "✅ All tables processed (some may be missing).",
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error(
      "[CAPTURE] Error capturing/sending tables",
      err?.message || err
    );
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId || process.env.TELEGRAM_CHAT_ID,
      text: "❌ Failed to capture tables. Please try again later.",
      parse_mode: "HTML",
    });
  }
}
