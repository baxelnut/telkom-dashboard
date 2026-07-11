import puppeteer from "puppeteer";

// Prevent duplicate runs in same process
if (globalThis.__SEND_SCHEDULED_REPORTS_LOCK__) {
  console.log(
    `[${new Date().toISOString()}] Duplicate run detected exiting.`,
  );
  process.exit(0);
}
globalThis.__SEND_SCHEDULED_REPORTS_LOCK__ = true;

// Schedule guard (comment out while debugging locally)
const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const now = new Date();
const utcHour = now.getUTCHours();
const utcDay = now.getUTCDay();

const isScheduledDay = utcDay === 1; // Monday (1)
const isInTimeWindow = utcHour >= 3 && utcHour < 11; // 03:00-11:00 UTC (10:00-18:00 WIB)

if (!(isScheduledDay && isInTimeWindow)) {
  console.log(
    `⏰ Skipping run. Outside schedule. UTC Day=${utcDay}, Hour=${utcHour}`,
  );
  process.exit(0);
}

export const sendScheduledReports = async (config) => {
  const EMAIL = config.TELKOM_DASHBOARD_EMAIL;
  const PASSWORD = config.TELKOM_DASHBOARD_PASSWORD;
  const BASE_URL = config.BASE_URL;

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

    // Wait for inputs
    await page.waitForSelector('input[type="email"]', { timeout: 20000 });
    await page.waitForSelector('input[type="password"]', { timeout: 20000 });

    // helper that types like a human
    async function humanType(selector, text) {
      await page.$eval(selector, (el) =>
        el.scrollIntoView({ block: "center" }),
      );
      await page.focus(selector);

      try {
        await page.keyboard.down("Control");
        await page.keyboard.press("KeyA");
        await page.keyboard.up("Control");
      } catch {
        await page.$eval(selector, (el) => {
          el.value = "";
        });
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

    // Click login
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

    if (!clicked) {
      console.log("[DBG] #login-btn click failed, trying fallback...");
      const rect = await page
        .$eval("#login-btn", (el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, top: r.top, w: r.width, h: r.height };
        })
        .catch(() => null);
      if (rect) {
        const cx = Math.round(rect.left + rect.w / 2);
        const cy = Math.round(rect.top + rect.h / 2);
        try {
          await page.mouse.move(cx, cy, { steps: 6 });
          await page.mouse.click(cx, cy);
        } catch (e) {
          console.log("[DBG] mouse click fallback failed:", e.message);
        }
      }
    }

    // Wait for overview marker
    try {
      await Promise.race([
        page.waitForSelector("div.page.overview", { timeout: 45000 }),
        page.waitForFunction(
          () => window.location.pathname.includes("/overview"),
          { timeout: 45000 },
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
      console.log(`📄 Navigating to ${path}...`);
      await page.goto(`${BASE_URL}${path}`, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      try {
        console.log(`🔍 Waiting for ${buttonId}...`);
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
