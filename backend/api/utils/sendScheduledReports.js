import fs from "fs";
import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const PID = process.pid;
console.log(
  `[${new Date().toISOString()}] [run:${RUN_ID}] [pid:${PID}] script loaded`
);

// Prevent duplicate runs in same process
if (globalThis.__SEND_SCHEDULED_REPORTS_LOCK__) {
  console.log(
    `[${new Date().toISOString()}] Duplicate run detected — exiting.`
  );
  process.exit(0);
}
globalThis.__SEND_SCHEDULED_REPORTS_LOCK__ = true;

// CONFIG (from secrets)
const EMAIL = process.env.TELKOM_DASHBOARD_EMAIL;
const PASSWORD = process.env.TELKOM_DASHBOARD_PASSWORD;
const BASE_URL = "https://rso2telkomdashboard.web.app";

// Schedule guard: Mon + Fri, 06:00–11:00 UTC (13:00–18:00 WIB)
const now = new Date();
const utcHour = now.getUTCHours();
const utcDay = now.getUTCDay();
const isScheduledDay = utcDay === 1 || utcDay === 5;
const isInTimeWindow = utcHour >= 6 && utcHour < 11;
if (!(isScheduledDay && isInTimeWindow)) {
  console.log(
    `[${new Date().toISOString()}] Outside schedule window — exiting.`
  );
  process.exit(0);
}

export const sendScheduledReports = async () => {
  console.log(
    `[${new Date().toISOString()}] [run:${RUN_ID}] Starting sendScheduledReports()`
  );

  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS === "false" ? false : true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();

  try {
    console.log("🌐 Navigating to login page...");
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Type credentials
    await page.type('input[type="email"]', EMAIL, { delay: 50 });
    await page.type('input[type="password"]', PASSWORD, { delay: 50 });

    console.log("🔘 Clicking login button...");
    await page.click("#login-btn");
    await page.waitForTimeout(1500);

    // Success detection
    await Promise.race([
      page.waitForSelector("div.page.overview", { timeout: 45000 }),
      page.waitForFunction(
        () => window.location.pathname.includes("/overview"),
        { timeout: 45000 }
      ),
    ]);

    console.log("✅ Logged in successfully.");

    // Report list
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
      console.log(`📄 Navigating to ${name} report...`);
      await page.goto(`${BASE_URL}${path}`, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      try {
        await page.waitForSelector(buttonId, { timeout: 15000 });
        await page.click(buttonId);
        await page.waitForTimeout(6000);
        console.log(`📢 ${name} report sent.`);
      } catch (err) {
        console.warn(`⚠️ Error sending ${name}: ${err.message}`);
        // Save debug artifacts for investigation
        const safeTime = new Date().toISOString().replace(/[:.]/g, "-");
        await page
          .screenshot({ path: `debug-${name}-${safeTime}.png`, fullPage: true })
          .catch(() => {});
        const html = await page.content().catch(() => "<no-html>");
        fs.writeFileSync(`debug-${name}-${safeTime}.html`, html);
      }
    }

    console.log("✅ All reports processed.");
  } catch (err) {
    console.error("❌ Fatal error during scheduled report:", err.message);
    // Save artifacts on failure
    const safeTime = new Date().toISOString().replace(/[:.]/g, "-");
    await page
      .screenshot({ path: `debug-fatal-${safeTime}.png`, fullPage: true })
      .catch(() => {});
    const html = await page.content().catch(() => "<no-html>");
    fs.writeFileSync(`debug-fatal-${safeTime}.html`, html);
  } finally {
    await browser.close();
    console.log(`[${new Date().toISOString()}] [run:${RUN_ID}] finished`);
  }
};

// Auto-run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  sendScheduledReports()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
