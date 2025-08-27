import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import puppeteer from "puppeteer";

const BASE_URL =
  process.env.API_BASE_URL || "https://rso2telkomdashboard.web.app";
const EMAIL = process.env.TELKOM_DASHBOARD_EMAIL;
const PASSWORD = process.env.TELKOM_DASHBOARD_PASSWORD;
const CHAT_ID = process.env.CHAT_ID || process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${(
  process.env.TELEGRAM_BOT_TOKEN || ""
).trim()}`;

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error("Missing TELEGRAM_BOT_TOKEN");
  process.exit(1);
}
if (!CHAT_ID) {
  console.error("Missing CHAT_ID input");
  process.exit(1);
}
if (!EMAIL || !PASSWORD) {
  console.error("Missing TELKOM_DASHBOARD_EMAIL/PASSWORD");
  process.exit(1);
}

const TABLES = (process.env.TABLES || "aosodomoro,galaksi")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const TABLE_CONF = {
  aosodomoro: {
    path: "/reports/aosodomoro",
    sel: ".aosodomoro-table table",
    name: "Aosodomoro",
  },
  galaksi: {
    path: "/reports/galaksi",
    sel: ".galaksi-table table",
    name: "Galaksi",
  },
};

async function sendTelegramText(text) {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
    });
  } catch {}
}

async function sendTelegramPhoto(filePath, caption) {
  const form = new FormData();
  form.append("chat_id", CHAT_ID);
  form.append("photo", fs.createReadStream(filePath));
  if (caption) form.append("caption", caption);
  try {
    await axios.post(`${TELEGRAM_API}/sendPhoto`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
  } finally {
    try {
      fs.unlinkSync(filePath);
    } catch {}
  }
}

async function humanType(page, selector, text) {
  await page.$eval(selector, (el) => el.scrollIntoView({ block: "center" }));
  await page.focus(selector);
  try {
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
  } catch {
    await page.$eval(selector, (el) => (el.value = ""));
  }
  await page.keyboard.press("Backspace");
  await page.keyboard.type(text, { delay: 50 });
  await page.$eval(selector, (el) => el.blur());
}

// clean table-only screenshot
async function screenshotElement(page, selector, filepath) {
  const el = await page.$(selector);
  if (!el) throw new Error(`Selector not found: ${selector}`);

  // Ensure table is fully expanded
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      el.style.overflow = "visible";
      el.style.maxHeight = "none";
      el.style.maxWidth = "none";
    }
  }, selector);

  // Wait for fonts (prevents Times New Roman fallback)
  await page.evaluateHandle("document.fonts.ready");

  // Get bounding box of table
  const box = await el.boundingBox();
  if (!box) throw new Error("Failed to get boundingBox");

  // Screenshot clipped exactly to table bounds
  await page.screenshot({
    path: filepath,
    type: "png",
    clip: {
      x: Math.floor(box.x),
      y: Math.floor(box.y),
      width: Math.ceil(box.width),
      height: Math.ceil(box.height),
    },
    captureBeyondViewport: true, // allow full capture even if bigger than viewport
  });
}

(async () => {
  console.log("🔥 Capture run at:", new Date().toISOString());

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });
  page.setDefaultNavigationTimeout(120000);

  try {
    // Login
    console.log("🌐 goto /login");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
    await page.waitForSelector('input[type="email"]', { timeout: 20000 });
    await page.waitForSelector('input[type="password"]', { timeout: 20000 });

    console.log("⌨️ typing creds");
    await humanType(page, 'input[type="email"]', EMAIL);
    await new Promise((r) => setTimeout(r, 500));
    await humanType(page, 'input[type="password"]', PASSWORD);
    await new Promise((r) => setTimeout(r, 800));

    await page.$eval("#login-btn", (el) => el.click());
    await Promise.race([
      page.waitForFunction(() => location.pathname.includes("/overview"), {
        timeout: 45000,
      }),
      page.waitForSelector("div.page.overview", { timeout: 45000 }),
    ]).catch(() => {});
    console.log("✅ logged in");

    // Capture each table
    for (const key of TABLES) {
      const t = TABLE_CONF[key];
      if (!t) continue;

      console.log(`📄 goto ${t.path}`);
      await page.goto(`${BASE_URL}${t.path}`, { waitUntil: "networkidle2" });

      console.log(`🔍 wait ${t.sel}`);
      await page.waitForSelector(t.sel, { timeout: 45000 });
      await page.$eval(t.sel, (el) => el.scrollIntoView({ block: "center" }));
      await new Promise((r) => setTimeout(r, 800));

      const file = path.join(process.cwd(), `capture-${key}-${Date.now()}.png`);
      await screenshotElement(page, t.sel, file);
      console.log(`💾 saved ${file}`);

      await sendTelegramPhoto(file, `📊 ${t.name} Table`);
    }

    await sendTelegramText("✅ All done");
  } catch (e) {
    console.error("❌ Capture failed:", e);
    await sendTelegramText(`❌ Failed: ${e.message || e}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
