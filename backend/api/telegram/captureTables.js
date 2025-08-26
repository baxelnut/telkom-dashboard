import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { execSync } from "child_process";

const TEMP_DIR = process.env.TEMP_DIR || "/tmp";
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Common paths to check for system chromium
const COMMON_CHROMIUM_PATHS = [
  process.env.CHROMIUM_PATH,
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
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
    console.log(`[CAPTURE] Deleted temp file ${filePath}`);
  } catch (e) {
    console.warn(`[CAPTURE] Failed to delete ${filePath}:`, e?.message || e);
  }
}

/* Try puppeteer-core with system chromium */
async function tryLaunchPuppeteerCoreWithSystemChromium() {
  try {
    const puppeteerCore = (await import("puppeteer-core")).default;

    for (const p of COMMON_CHROMIUM_PATHS) {
      if (!p) continue;
      try {
        if (fs.existsSync(p)) {
          console.log(`[DEBUG] Found possible chromium at: ${p}`);
          try {
            const version = execSync(`${p} --version`).toString();
            console.log(`[DEBUG] Chromium version: ${version}`);
          } catch (err) {
            console.warn(
              `[DEBUG] Failed to get version from ${p}:`,
              err.message
            );
          }

          console.log(
            `[CAPTURE] Found system chromium at ${p} — launching puppeteer-core`
          );
          const browser = await puppeteerCore.launch({
            executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--disable-gpu",
              "--no-zygote",
              "--single-process",
            ],
          });
          return browser;
        }
      } catch (err) {
        console.warn(
          `[CAPTURE] puppeteer-core failed to launch with ${p}:`,
          err?.message || err
        );
      }
    }

    console.log(
      "[CAPTURE] puppeteer-core available but no system chromium found in common paths"
    );
    return null;
  } catch (err) {
    console.log("[CAPTURE] puppeteer-core not available:", err?.message || err);
    return null;
  }
}

/* Fallback to bundled puppeteer (only if you kept it) */
async function tryLaunchBundledPuppeteer() {
  try {
    console.log(
      "[CAPTURE] launching bundled puppeteer (may download or use cached chromium)"
    );
    const puppeteer = (await import("puppeteer")).default;
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--single-process",
        "--disable-extensions",
        "--hide-scrollbars",
        "--remote-debugging-port=9222",
      ],
      headless: true,
      defaultViewport: { width: 1200, height: 800 },
      timeout: 60000,
    });

    return browser;
  } catch (err) {
    console.log(
      "[CAPTURE] bundled puppeteer launch failed:",
      err?.message || err
    );
    return null;
  }
}

async function getBrowserInstance() {
  // 1) try puppeteer-core + system chromium
  let browser = await tryLaunchPuppeteerCoreWithSystemChromium();
  if (browser) return browser;

  // 2) fallback to bundled puppeteer
  browser = await tryLaunchBundledPuppeteer();
  if (browser) return browser;

  throw new Error(
    "No available Chromium launcher (puppeteer-core with system chromium or puppeteer)."
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
      console.warn(
        `[CAPTURE] waitForSelector timed out for ${selector} on ${url}`
      );
      await page.close();
      await browser.close();
      return null;
    }

    const element = await page.$(selector);
    if (!element) {
      console.warn(`[CAPTURE] Element not found: ${selector} on ${url}`);
      await page.close();
      await browser.close();
      return null;
    }

    const filePath = path.join(TEMP_DIR, filename);
    await element.screenshot({ path: filePath });
    console.log(`[CAPTURE] Screenshot saved: ${filePath}`);

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

    const tables = [
      {
        name: "Aosodomoro",
        url:
          process.env.AOSODOMORO_URL ||
          "https://rso2telkomdashboard.web.app/reports/aosodomoro",
        selector: ".aosodomoro-table",
      },
      {
        name: "Galaksi",
        url:
          process.env.GALAKSI_URL ||
          "https://rso2telkomdashboard.web.app/reports/galaksi",
        selector: ".galaksi-table",
      },
    ];

    for (const t of tables) {
      try {
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
      } catch (singleErr) {
        console.error(
          `[CAPTURE] Error capturing ${t.name}:`,
          singleErr?.message || singleErr
        );
      }
    }

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "✅ All table capture attempts finished (some may be missing).",
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error(
      "[CAPTURE] Error capturing/sending tables:",
      err?.message || err
    );
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId || process.env.TELEGRAM_CHAT_ID,
        text: "❌ Failed to capture tables. Please try again later.",
        parse_mode: "HTML",
      });
    } catch (_) {}
  }
}
