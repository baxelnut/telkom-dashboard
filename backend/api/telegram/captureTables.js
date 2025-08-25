import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

const TEMP_DIR = process.env.TEMP_DIR || "/tmp";
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

async function tryLaunchWithChromeAwsLambda() {
  try {
    const chromeLambda = await import("chrome-aws-lambda");
    const puppeteerCore = (await import("puppeteer-core")).default;

    const execPath = await chromeLambda.executablePath;
    if (!execPath) {
      console.log("[CAPTURE] chrome-aws-lambda found but no executablePath");
      return null;
    }

    console.log("[CAPTURE] launching chromium via chrome-aws-lambda");
    const browser = await puppeteerCore.launch({
      args: [
        ...chromeLambda.args,
        "--hide-scrollbars",
        "--disable-web-security",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
      defaultViewport: chromeLambda.defaultViewport,
      executablePath: execPath,
      headless: chromeLambda.headless,
    });

    return browser;
  } catch (err) {
    console.log(
      "[CAPTURE] chrome-aws-lambda launch failed:",
      err?.message || err
    );
    return null;
  }
}

async function tryLaunchWithPuppeteer() {
  try {
    const puppeteer = (await import("puppeteer")).default;
    console.log("[CAPTURE] launching puppeteer (bundled Chromium)");
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      headless: true,
    });
    return browser;
  } catch (err) {
    console.log("[CAPTURE] puppeteer launch failed:", err?.message || err);
    return null;
  }
}

async function getBrowserInstance() {
  // Try chrome-aws-lambda first (serverless-friendly), then fallback to puppeteer.
  let browser = await tryLaunchWithChromeAwsLambda();
  if (browser) return browser;

  browser = await tryLaunchWithPuppeteer();
  if (browser) return browser;

  throw new Error(
    "No available Chromium launcher (chrome-aws-lambda or puppeteer)."
  );
}

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
    console.warn(
      `[CAPTURE] Failed to delete file: ${filePath}`,
      err?.message || err
    );
  }
}

async function captureTable({ url, selector, filename }) {
  console.log(`[CAPTURE] Opening ${url} to capture "${selector}"`);
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  try {
    // generous timeout to allow dashboard assets to load
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // wait for the selector to exist on the page
    try {
      await page.waitForSelector(selector, { timeout: 10000 });
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

    // screenshot element
    await element.screenshot({ path: filePath });
    console.log(`[CAPTURE] Screenshot saved: ${filePath}`);

    await page.close();
    await browser.close();
    return filePath;
  } catch (err) {
    // ensure closing browser on unexpected error
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

    if (aosPath) {
      await sendPhotoToTelegram({
        TELEGRAM_API,
        chatId,
        filePath: aosPath,
        caption: "📊 Aosodomoro Table",
      });
    } else {
      console.warn("[CAPTURE] Aosodomoro table screenshot not produced");
    }

    if (galaksiPath) {
      await sendPhotoToTelegram({
        TELEGRAM_API,
        chatId,
        filePath: galaksiPath,
        caption: "📊 Galaksi Table",
      });
    } else {
      console.warn("[CAPTURE] Galaksi table screenshot not produced");
    }

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "✅ All tables processed (some may be missing).",
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error(
      "[CAPTURE] Error capturing/sending tables",
      err?.response?.data || err?.message || err
    );
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId || process.env.TELEGRAM_CHAT_ID,
      text: "❌ Failed to capture tables. Please try again later.",
      parse_mode: "HTML",
    });
  }
}
