import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

const TEMP_DIR = process.env.TEMP_DIR || "/tmp";
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Common paths to look for system chrome/chromium
const COMMON_CHROMIUM_PATHS = [
  process.env.CHROMIUM_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome-stable",
  "/snap/bin/chromium",
].filter(Boolean);

/**
 * send screenshot to telegram using bot API url (TELEGRAM_API = https://api.telegram.org/bot<token>)
 */
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

  const resp = await axios.post(`${TELEGRAM_API}/sendPhoto`, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  // delete local file after sending (best-effort)
  try {
    fs.unlinkSync(filePath);
    console.log(`[CAPTURE] Deleted temp file ${filePath}`);
  } catch (e) {
    console.warn(`[CAPTURE] Failed to delete ${filePath}:`, e?.message || e);
  }

  return resp.data;
}

/**
 * Try to launch puppeteer-core with a system chromium executable path
 */
async function tryLaunchPuppeteerCoreWithSystemChromium() {
  try {
    const puppeteerCore = (await import("puppeteer-core")).default;
    for (const p of COMMON_CHROMIUM_PATHS) {
      if (!p) continue;
      try {
        if (fs.existsSync(p)) {
          console.log(
            `[CAPTURE] Found system chromium at ${p} — launching via puppeteer-core`
          );
          const browser = await puppeteerCore.launch({
            executablePath: p,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--hide-scrollbars",
            ],
            headless: true,
            defaultViewport: { width: 1200, height: 800 },
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

/**
 * Try to launch bundled puppeteer. If a system chromium path exists, pass it as executablePath (avoids redownloading).
 */
async function tryLaunchBundledPuppeteer() {
  try {
    const puppeteer = (await import("puppeteer")).default;

    // prefer system path if present to avoid puppeteer-provided chromium mismatch / download issues
    let execPath = null;
    for (const p of COMMON_CHROMIUM_PATHS) {
      if (p && fs.existsSync(p)) {
        execPath = p;
        break;
      }
    }

    console.log(
      `[CAPTURE] launching bundled puppeteer (executablePath=${
        execPath || "default"
      })`
    );
    const launchOpts = {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--hide-scrollbars",
      ],
      headless: true,
      defaultViewport: { width: 1200, height: 800 },
    };
    if (execPath) launchOpts.executablePath = execPath;

    const browser = await puppeteer.launch(launchOpts);
    return browser;
  } catch (err) {
    console.log(
      "[CAPTURE] bundled puppeteer launch failed:",
      err?.message || err
    );
    return null;
  }
}

/**
 * Return a browser instance, trying options in order:
 * 1) puppeteer-core with system chromium executable
 * 2) bundled puppeteer (optionally using system chromium path)
 */
async function getBrowserInstance() {
  let browser = await tryLaunchPuppeteerCoreWithSystemChromium();
  if (browser) return browser;

  browser = await tryLaunchBundledPuppeteer();
  if (browser) return browser;

  throw new Error(
    "No available Chromium launcher (puppeteer-core with system chromium or puppeteer)."
  );
}

/**
 * Capture the element (selector) screenshot on given url.
 * Returns path string or null if not captured.
 */
async function captureTable({ url, selector, filename }) {
  console.log(`[CAPTURE] Opening ${url} to capture "${selector}"`);
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  try {
    // generous timeout so dashboard has time to load
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // wait for selector
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

/**
 * Main entry called from alert handler.
 * - chatId: telegram chat id
 * - TELEGRAM_API: full telegram api url, e.g. https://api.telegram.org/bot<token>
 */
export default async function handleCaptureTables({ chatId, TELEGRAM_API }) {
  try {
    console.log("[CAPTURE] start: sending 'capturing' message to user");
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "🚨 Capturing tables. Please wait...",
      parse_mode: "HTML",
    });

    // Per-table configuration (easily extensible)
    // NOTE: these URLs/selectors can be moved to env if you prefer not to hardcode
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
