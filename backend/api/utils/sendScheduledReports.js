import fs from "fs";
import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const PID = process.pid;

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

// Schedule guard (comment out while debugging locally)
const now = new Date();
const utcHour = now.getUTCHours();
const utcDay = now.getUTCDay();
const isScheduledDay = utcDay === 1 || utcDay === 5;
const isInTimeWindow = utcHour >= 6 && utcHour < 11; // 06:00-11:00 UTC => 13:00-18:00 WIB
if (!(isScheduledDay && isInTimeWindow)) process.exit(0);

export const sendScheduledReports = async () => {
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

    // helper that types like a human into a selector
    async function humanType(selector, text) {
      // scroll into view and focus
      await page.$eval(selector, (el) =>
        el.scrollIntoView({ block: "center" })
      );
      await page.focus(selector);

      // clear existing (CTRL+A / Backspace)
      try {
        await page.keyboard.down("Control");
        await page.keyboard.press("KeyA");
        await page.keyboard.up("Control");
      } catch (e) {
        // fallback: select via JS
        await page.$eval(selector, (el) => {
          el.value = "";
        });
      }
      await page.keyboard.press("Backspace");

      // type slowly so React handlers receive events
      await page.keyboard.type(text, { delay: 60 });

      // blur to trigger onBlur handlers
      await page.$eval(selector, (el) => el.blur());
    }

    console.log("⌨️ Typing email via keyboard...");
    await humanType('input[type="email"]', EMAIL);

    // give React a little time to update state
    await new Promise((r) => setTimeout(r, 800));

    console.log("⌨️ Typing password via keyboard...");
    await humanType('input[type="password"]', PASSWORD);

    // longer wait so parent setState has time to propagate
    await new Promise((r) => setTimeout(r, 1200));

    // verify values in DOM
    const vals = await page.evaluate(() => {
      const e = document.querySelector('input[type="email"]')?.value || "";
      const p = document.querySelector('input[type="password"]')?.value || "";
      return { email: e, passLen: p.length };
    });

    // check for visible validation errors BEFORE clicking
    const preClickErrors = await page
      .$$eval(
        ".error, .error-msg, .toast-error, .notification--error, .error-message, .alert",
        (els) => els.map((e) => e.innerText.trim()).filter(Boolean)
      )
      .catch(() => []);
    if (preClickErrors.length > 0) {
      console.log(
        `[ERR] validation errors present before submit: ${JSON.stringify(
          preClickErrors
        )}`
      );
      // save debug artifacts & bail
      const safeTime = new Date().toISOString().replace(/[:.]/g, "-");
      await page
        .screenshot({ path: `debug-pre-click-${safeTime}.png`, fullPage: true })
        .catch(() => {});
      const html = await page.content().catch(() => "<no-html>");
      fs.writeFileSync(`debug-pre-click-${safeTime}.html`, html);
      throw new Error(
        "Validation errors present before submit — aborting click."
      );
    }

    // click submit robustly
    console.log(
      "🔘 Clicking login button (el.click() then mouse click fallback)..."
    );
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

    await new Promise((r) => setTimeout(r, 500));

    if (!clicked) {
      console.log(
        "[DBG] el.click() didn't run or #login-btn missing — trying fallback mouse click"
      );
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
      } else {
        // fallback search button by text and click
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
    }

    // wait a small bit for handlers
    await new Promise((r) => setTimeout(r, 1200));

    // after click, look for immediate visible errors
    const postClickErrors = await page
      .$$eval(
        ".error, .error-msg, .toast-error, .notification--error, .error-message, .alert",
        (els) => els.map((e) => e.innerText.trim()).filter(Boolean)
      )
      .catch(() => []);

    if (postClickErrors.length > 0) {
      console.log(
        `[ERR] post-click visible errors: ${JSON.stringify(postClickErrors)}`
      );
    }

    // Robust success detection: DOM marker or pathname or localStorage/cookies
    try {
      await Promise.race([
        page.waitForSelector("div.page.overview", { timeout: 45000 }),
        page.waitForFunction(
          () => window.location.pathname.includes("/overview"),
          { timeout: 45000 }
        ),
        page.waitForFunction(
          () => {
            try {
              return Object.keys(localStorage).some((k) =>
                /auth|token|idToken|firebase|session/i.test(k)
              );
            } catch (e) {
              return false;
            }
          },
          { timeout: 45000 }
        ),
        page.waitForFunction(
          () => document.cookie && document.cookie.length > 0,
          { timeout: 45000 }
        ),
      ]);
    } catch (loginErr) {
      // save debug artifacts
      const safeTime = new Date().toISOString().replace(/[:.]/g, "-");
      console.log(
        `[ERR] Login not detected. Saving debug artifacts debug-post-login-${safeTime}.*`
      );
      await page
        .screenshot({
          path: `debug-post-login-${safeTime}.png`,
          fullPage: true,
        })
        .catch(() => {});
      const html = await page.content().catch(() => "<no-html>");
      fs.writeFileSync(`debug-post-login-${safeTime}.html`, html);

      // collect and print visible errors & cookies/localStorage
      const visibleErrs = await page
        .$$eval(
          ".error, .error-msg, .toast-error, .notification--error, .error-message, .alert",
          (els) => els.map((e) => e.innerText.trim()).filter(Boolean)
        )
        .catch(() => []);
      const cookies = await page.cookies().catch(() => []);
      const ls = await page
        .evaluate(() => Object.keys(localStorage))
        .catch(() => []);

      throw new Error("Login did not reach overview within timeout.");
    }

    console.log("✅ Logged in successfully.");

    // proceed with your report clicks (unchanged)
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

// Auto-run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  sendScheduledReports();
}
