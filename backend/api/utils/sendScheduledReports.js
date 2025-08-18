// sendScheduledReports.js
import fs from "fs";
import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

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
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    console.log("🌐 Navigating to login page...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });

    console.log("⌨️ Typing email and password...");
    await page.type('input[type="email"]', EMAIL);
    await page.type('input[type="password"]', PASSWORD);

    console.log("🔘 Clicking login button...");
    await page.click("#login-btn");
    await page.waitForSelector(".page.overview", { timeout: 30000 });

    console.log("Logged in successfully.");

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
        await page.waitForSelector(buttonId, { timeout: 5000 });

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
  }
};
