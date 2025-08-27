import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { execSync } from "child_process";

const TEMP_DIR = process.env.TEMP_DIR || "/tmp";
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Common candidate paths (will be checked at runtime)
const CANDIDATE_PATHS = [
  process.env.CHROMIUM_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/snap/bin/chromium",
  "/bin/chromium",
  "/opt/google/chrome/chrome",
].filter(Boolean);

/* helper to find an existing binary */
function findChromiumBinary() {
  // 1) check env override
  if (process.env.CHROMIUM_PATH && fs.existsSync(process.env.CHROMIUM_PATH)) {
    return process.env.CHROMIUM_PATH;
  }

  // 2) check PATH via which
  try {
    const whichOut = execSync(
      "which chromium-browser || which chromium || which google-chrome-stable || which google-chrome",
      { stdio: ["ignore", "pipe", "ignore"] }
    )
      .toString()
      .trim();
    if (whichOut) {
      if (fs.existsSync(whichOut)) return whichOut;
    }
  } catch (_) {
    // ignore
  }

  // 3) fall back to common candidate list
  for (const p of CANDIDATE_PATHS) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch (_) {}
  }

  return null;
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

  try {
    fs.unlinkSync(filePath);
    console.log(`[CAPTURE] Deleted temp file ${filePath}`);
  } catch (e) {
    console.warn(`[CAPTURE] Failed to delete ${filePath}:`, e?.message || e);
  }
}

/* Create robust launcher with multiple fallbacks */
async function createBrowser() {
  const headless = process.env.HEADLESS === "false" ? false : true;
  const commonArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-zygote",
    "--single-process",
    "--disable-extensions",
    "--hide-scrollbars",
    "--disable-software-rasterizer",
    "--disable-features=VizDisplayCompositor,NetworkService", // sometimes helps in container
  ];

  // Try bundled puppeteer first (works if your package.json includes "puppeteer")
  try {
    const puppeteer = (await import("puppeteer")).default;
    console.log("[CAPTURE] launching puppeteer (bundled)");
    return await puppeteer.launch({
      headless,
      args: commonArgs,
      defaultViewport: { width: 1200, height: 900 },
      timeout: 120000,
      dumpio: true, // important for container logs
    });
  } catch (err) {
    console.warn(
      "[CAPTURE] bundled puppeteer not available:",
      err?.message || err
    );
  }

  // Fallback -> try to find system chromium / google-chrome
  const { execSync } = await import("child_process");
  const candidates = [
    process.env.CHROMIUM_PATH,
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/snap/bin/chromium",
  ].filter(Boolean);

  // try `which` as well
  try {
    const whichOut = execSync(
      "which chromium-browser || which chromium || which google-chrome-stable || which google-chrome",
      { stdio: ["ignore", "pipe", "ignore"] }
    )
      .toString()
      .trim();
    if (whichOut) candidates.unshift(whichOut);
  } catch (_) {}

  let bin = null;
  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) {
        bin = p;
        break;
      }
    } catch (_) {}
  }

  if (!bin) {
    throw new Error(
      "No system Chromium/Chrome binary found in container. Tried: " +
        candidates.join(", ")
    );
  }

  console.log(`[CAPTURE] using system chromium at: ${bin} (puppeteer-core)`);

  try {
    const puppeteerCore = (await import("puppeteer-core")).default;
    return await puppeteerCore.launch({
      executablePath: bin,
      headless,
      args: commonArgs,
      defaultViewport: { width: 1200, height: 900 },
      timeout: 120000,
      dumpio: true,
    });
  } catch (err) {
    console.error(
      "[CAPTURE] puppeteer-core launch failed:",
      err?.message || err
    );
    throw err;
  }
}

async function captureTable({
  url,
  selector,
  filename,
  needsAuth = false,
  email,
  password,
}) {
  console.log(`[CAPTURE] Opening ${url} to capture "${selector}"`);
  const browser = await createBrowser();
  const page = await browser.newPage();

  try {
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });

    // Optional login (same technique as your scheduled script)
    if (needsAuth && email && password) {
      try {
        await page.waitForSelector('input[type="email"]', { timeout: 20000 });
        await page.waitForSelector('input[type="password"]', {
          timeout: 20000,
        });

        // fill like human (small helper)
        const humanType = async (selector, text) => {
          await page.$eval(selector, (el) =>
            el.scrollIntoView({ block: "center" })
          );
          await page.focus(selector);
          try {
            await page.keyboard.down("Control");
            await page.keyboard.press("KeyA");
            await page.keyboard.up("Control");
          } catch (_) {
            await page.$eval(selector, (el) => (el.value = ""));
          }
          await page.keyboard.press("Backspace");
          await page.keyboard.type(text, { delay: 60 });
          await page.$eval(selector, (el) => el.blur());
        };

        await humanType('input[type="email"]', email);
        await new Promise((r) => setTimeout(r, 800));
        await humanType('input[type="password"]', password);
        await new Promise((r) => setTimeout(r, 1200));

        // click login
        const clicked = await page
          .$eval("#login-btn", (el) => {
            try {
              el.click();
              return true;
            } catch (e) {
              return false;
            }
          })
          .catch(() => false);

        if (!clicked) {
          await page
            .$$eval("button, a[role='button']", (els) => {
              const found = els.find((el) =>
                /login|sign ?in|sign ?up/i.test(el.innerText || "")
              );
              if (found)
                try {
                  found.click();
                } catch (e) {}
            })
            .catch(() => {});
        }

        // wait for some sign of login success (best-effort)
        await Promise.race([
          page
            .waitForSelector("div.page.overview", { timeout: 45000 })
            .catch(() => {}),
          page
            .waitForFunction(
              () => window.location.pathname.includes("/overview"),
              { timeout: 45000 }
            )
            .catch(() => {}),
          page
            .waitForFunction(
              () => {
                try {
                  return Object.keys(localStorage).some((k) =>
                    /auth|token|idToken|firebase|session/i.test(k)
                  );
                } catch {
                  return false;
                }
              },
              { timeout: 45000 }
            )
            .catch(() => {}),
        ]).catch(() => {
          console.warn(
            "[CAPTURE] Login detection timed out — continuing (maybe page is public)"
          );
        });
      } catch (loginErr) {
        console.warn(
          "[CAPTURE] Login attempt failed:",
          loginErr?.message || loginErr
        );
      }
    }

    await page.waitForSelector(selector, { timeout: 30000 });
    await page.$eval(selector, (el) => {
      el.scrollIntoView({ block: "center" });
    });

    // allow any SPA animation/rendering
    await new Promise((r) => setTimeout(r, 800));

    const element = await page.$(selector);
    if (!element) {
      console.warn(`[CAPTURE] Element not found: ${selector} on ${url}`);
      await page.close();
      await browser.close();
      return null;
    }

    const filePath = path.join(
      TEMP_DIR,
      filename || `capture-${Date.now()}.png`
    );
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

    // if the dashboard is protected, set TELKOM_DASHBOARD_EMAIL & TELKOM_DASHBOARD_PASSWORD env vars
    const needsAuth = !!(
      process.env.TELKOM_DASHBOARD_EMAIL &&
      process.env.TELKOM_DASHBOARD_PASSWORD
    );
    const EMAIL = process.env.TELKOM_DASHBOARD_EMAIL;
    const PASSWORD = process.env.TELKOM_DASHBOARD_PASSWORD;

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
          needsAuth,
          email: EMAIL,
          password: PASSWORD,
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
        text: "❌ Failed to capture tables. Please try again.",
        parse_mode: "HTML",
      });
    } catch (_) {}
  }
}
