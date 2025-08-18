// sendScheduledReports.js
import fs from "fs";
import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const PID = process.pid;

console.log(
  `[${new Date().toISOString()}] [run:${RUN_ID}] [pid:${PID}] script loaded`
);

if (globalThis.__SEND_SCHEDULED_REPORTS_LOCK__) {
  console.log(
    `[${new Date().toISOString()}] [run:${RUN_ID}] [pid:${PID}] Detected previous run. Exiting early to avoid duplicate execution.`
  );
  // optional: dump a trace so you can see where the first call came from
  console.trace();
  // stop further execution
  // If you prefer to explicitly fail the CI when duplicates are detected, use process.exit(1)
  // but typically we just return/exit cleanly to avoid double-actions.
  // For a module import scenario returning is enough, but since this file is run as entry, just exit.
  process.exit(0);
}

// Set the global lock so subsequent imports/calls won't run again in this process
globalThis.__SEND_SCHEDULED_REPORTS_LOCK__ = true;

const EMAIL = process.env.TELKOM_DASHBOARD_EMAIL;
const PASSWORD = process.env.TELKOM_DASHBOARD_PASSWORD;
const BASE_URL = "https://rso2telkomdashboard.web.app";

const now = new Date();
const timestamp = now.toISOString();
const utcHour = now.getUTCHours();
const utcDay = now.getUTCDay(); // Monday = 1, Friday = 5

const isScheduledDay = utcDay === 1 || utcDay === 5;
const isInTimeWindow = utcHour >= 6 && utcHour < 11; // 13:00–18:00 WIB

console.log(`[${timestamp}] ⏰ Triggering Telegram report automation...`);

// Enforce time window
if (!(isScheduledDay && isInTimeWindow)) {
  console.log(
    "⏹️ Not within scheduled time window (Mon/Fri >13:00 WIB). Skipping."
  );
  process.exit(0);
}

// Start Puppeteer and send report
export const sendScheduledReports = async () => {
  console.log(
    `[${new Date().toISOString()}] [run:${RUN_ID}] Starting sendScheduledReports()`
  );

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();

  try {
    console.log("🌐 Navigating to login page...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });

    // Wait for inputs to be present
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });

    console.log("⌨️ Setting email and password (React-friendly)...");
    await page.$eval(
      'input[type="email"]',
      (el, value) => {
        el.focus();
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.blur();
      },
      EMAIL
    );

    await page.$eval(
      'input[type="password"]',
      (el, value) => {
        el.focus();
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.blur();
      },
      PASSWORD
    );

    // small grace so client handlers start
    await new Promise((res) => setTimeout(res, 250));

    console.log("🔘 Clicking login button (in-page click)...");
    const clicked = await page
      .$$eval("#login-btn", (els) => {
        if (!els || els.length === 0) return false;
        els[0].click();
        return true;
      })
      .catch(() => false);

    if (!clicked) {
      await page
        .$$eval("button", (els) => {
          const b = els.find((el) =>
            /login|sign ?in|sign ?up/i.test(el.innerText || "")
          );
          if (b) b.click();
        })
        .catch(() => {});
    }

    // Wait for either the overview DOM marker or a pathname change
    try {
      await Promise.race([
        page.waitForSelector("div.page.overview", { timeout: 45000 }),
        page.waitForFunction(
          () => window.location.pathname.includes("/overview"),
          { timeout: 45000 }
        ),
      ]);
    } catch (loginWaitErr) {
      // capture debug artifacts
      const safeTime = timestamp.replace(/[:.]/g, "-");
      await page.screenshot({
        path: `debug-post-login-${safeTime}.png`,
        fullPage: true,
      });
      const html = await page.content();
      fs.writeFileSync(`debug-post-login-${safeTime}.html`, html);

      const loginErrorText = await page
        .$$eval(
          ".error, .error-msg, .toast-error, .notification--error, .ant-message, .MuiAlert-root",
          (els) => els.map((e) => e.innerText).join(" | ")
        )
        .catch(() => "");

      throw new Error(
        `Login did not reach overview within 45s. ${
          loginErrorText ? "Visible error: " + loginErrorText : ""
        }`
      );
    }

    console.log("✅ Logged in successfully.");

    const reportPages = [
      {
        name: "AOSODOMORO",
        path: "/reports/aosodomoro",
        buttonId: "#announce-aosodomoro",
      },
      {
        name: "GALAKSI",
        path: "/reports/galaksi",
        buttonId: "#announce-galaksi",
      },
    ];

    for (const { name, path, buttonId } of reportPages) {
      console.log(`📄 Navigating to ${path} for ${name} report...`);
      await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle2" });

      try {
        console.log(`🔍 Waiting for ${buttonId}...`);
        await page.waitForSelector(buttonId, { timeout: 10000 });

        const btn = await page.$(buttonId);
        if (btn) {
          console.log(`📢 Clicking ${buttonId} to send ${name}...`);
          await btn.click();

          // Wait for frontend to process image capture & upload
          await new Promise((res) => setTimeout(res, 6000));
          console.log(`${name} report sent.`);
        } else {
          console.warn(`⚠️ ${buttonId} not found on ${path}`);
        }
      } catch (err) {
        console.warn(`❌ Error sending ${name}: ${err.message}`);
      }
    }

    console.log("✅ All reports processed. Writing to log...");
  } catch (err) {
    console.error("❌ Fatal error during scheduled report:", err.message);
    const safeTime = timestamp.replace(/[:.]/g, "-");
    await page.screenshot({ path: `debug-${safeTime}.png`, fullPage: true });
    const html = await page.content();
    fs.writeFileSync(`debug-${safeTime}.html`, html);
  } finally {
    await browser.close();
    console.log(
      `[${new Date().toISOString()}] [run:${RUN_ID}] [pid:${PID}] finished`
    );
  }
};

// Run (called unguarded because you run from GitHub Actions)
if (import.meta.url === `file://${process.argv[1]}`) {
  sendScheduledReports();
}
