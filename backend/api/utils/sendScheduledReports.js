import puppeteer from "puppeteer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const EMAIL = process.env.TELKOM_DASHBOARD_EMAIL;
const PASSWORD = process.env.TELKOM_DASHBOARD_PASSWORD;
const BASE_URL = "http://localhost:5173"; // Dev mode

export const sendScheduledReports = async () => {
  const now = new Date();
  const timestamp = now.toISOString();
  const day = now.getDay(); // 1 = Monday, 5 = Friday
  const hour = now.getHours();
  const minute = now.getMinutes();

  console.log(`[${timestamp}] ⏰ Triggering Telegram report automation...`);

  // Only run on Monday & Friday at 13:00 (uncomment when ready)
  // if (!((day === 1 || day === 5) && hour === 13 && minute === 0)) return;

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  try {
    console.log("🌐 Navigating to login page...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });

    console.log("⌨️ Typing email and password...");
    await page.type('input[type="email"]', EMAIL);
    await page.type('input[type="password"]', PASSWORD);

    console.log("🔘 Clicking login button...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click("#login-btn"), // Ensure login button has id="login-btn"
    ]);

    if (!page.url().includes("/overview")) {
      throw new Error("Login failed — /overview not reached");
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
        await page.waitForSelector(buttonId, { timeout: 5000 });

        const btn = await page.$(buttonId);
        if (btn) {
          console.log(`📢 Clicking ${buttonId} to send ${name}...`);
          await btn.click();

          // Wait for frontend to process image capture & upload
          await new Promise((res) => setTimeout(res, 6000));

          console.log(`✅ ${name} report sent.`);
        } else {
          console.warn(`⚠️ ${buttonId} not found on ${path}`);
        }
      } catch (err) {
        console.warn(`❌ Error sending ${name}: ${err.message}`);
      }
    }

    console.log("✅ All reports processed.");
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
