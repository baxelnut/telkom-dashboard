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

// ✅ Removed sensitive logging
console.log("[INFO] Credentials loaded from .env");

// Schedule guard (comment out while debugging locally)
// const now = new Date();
// const utcHour = now.getUTCHours();
// const utcDay = now.getUTCDay();
// const isScheduledDay = utcDay === 1 || utcDay === 5;
// const isInTimeWindow = utcHour >= 6 && utcHour < 11;
// if (!(isScheduledDay && isInTimeWindow)) process.exit(0);

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

  page.on("console", (m) => {
    try {
      console.log(`[PAGE ${m.type()}] ${m.text()}`);
    } catch {}
  });

  try {
    console.log("🌐 Navigating to login page...");
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await page.waitForSelector('input[type="email"]', { timeout: 20000 });
    await page.waitForSelector('input[type="password"]', { timeout: 20000 });

    // Helper: type like a human
    async function humanType(selector, text) {
      await page.$eval(selector, (el) =>
        el.scrollIntoView({ block: "center" })
      );
      await page.focus(selector);
      try {
        await page.keyboard.down("Control");
        await page.keyboard.press("KeyA");
        await page.keyboard.up("Control");
      } catch {
        await page.$eval(selector, (el) => (el.value = ""));
      }
      await page.keyboard.press("Backspace");
      await page.keyboard.type(text, { delay: 60 });
      await page.$eval(selector, (el) => el.blur());
    }

    console.log("⌨️ Typing email...");
    await humanType('input[type="email"]', EMAIL);
    await new Promise((r) => setTimeout(r, 800));

    console.log("⌨️ Typing password...");
    await humanType('input[type="password"]', PASSWORD);
    await new Promise((r) => setTimeout(r, 1200));

    // Verify DOM input state
    const vals = await page.evaluate(() => {
      const e = document.querySelector('input[type="email"]')?.value || "";
      const p = document.querySelector('input[type="password"]')?.value || "";
      return { email: e, passLen: p.length };
    });
    console.log(
      `[DBG] DOM after typing: email="${vals.email}" passLen=${vals.passLen}`
    );

    // Validation before click
    const preClickErrors = await page
      .$$eval(
        ".error, .error-msg, .toast-error, .notification--error, .error-message, .alert",
        (els) => els.map((e) => e.innerText.trim()).filter(Boolean)
      )
      .catch(() => []);
    if (preClickErrors.length > 0) {
      throw new Error(
        `Validation errors present before submit: ${JSON.stringify(
          preClickErrors
        )}`
      );
    }

    // Click submit
    console.log("🔘 Clicking login button...");
    const clicked = await page
      .$eval("#login-btn", (el) => {
        try {
          el.click();
          return true;
        } catch {
          return false;
        }
      })
      .catch(() => false);

    await new Promise((r) => setTimeout(r, 1200));

    if (!clicked) {
      console.log("[WARN] #login-btn missing — trying fallback click");
      const rect = await page
        .$eval("#login-btn", (el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, top: r.top, w: r.width, h: r.height };
        })
        .catch(() => null);
      if (rect) {
        const cx = Math.round(rect.left + rect.w / 2);
        const cy = Math.round(rect.top + rect.h / 2);
        await page.mouse.move(cx, cy, { steps: 6 });
        await page.mouse.click(cx, cy);
      }
    }

    // Detect login success
    try {
      await Promise.race([
        page.waitForSelector("div.page.overview", { timeout: 45000 }),
        page.waitForFunction(
          () => window.location.pathname.includes("/overview"),
          { timeout: 45000 }
        ),
      ]);
    } catch {
      throw new Error("Login did not reach overview within timeout.");
    }

    console.log("✅ Logged in successfully.");

    // Reports
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
      await page.goto(`${BASE_URL}${path}`, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      try {
        await page.waitForSelector(buttonId, { timeout: 15000 });
        const btn = await page.$(buttonId);
        if (btn) {
          console.log(`📢 Clicking ${buttonId} to send ${name}...`);
          await btn.click();
          await new Promise((r) => setTimeout(r, 6000));
          console.log(`${name} report sent.`);
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
  } finally {
    await browser.close();
    console.log(`[${new Date().toISOString()}] [run:${RUN_ID}] finished`);
  }
};

// Auto-run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  sendScheduledReports();
}
