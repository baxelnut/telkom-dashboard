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

// Prevent double-run in same process
if (globalThis.__SEND_SCHEDULED_REPORTS_LOCK__) {
  console.log(
    `[${new Date().toISOString()}] [run:${RUN_ID}] [pid:${PID}] Detected previous run. Exiting early.`
  );
  console.trace();
  process.exit(0);
}
globalThis.__SEND_SCHEDULED_REPORTS_LOCK__ = true;

// ====== CONFIG / SECRETS ======
const EMAIL = process.env.TELKOM_DASHBOARD_EMAIL;
const PASSWORD = process.env.TELKOM_DASHBOARD_PASSWORD;
const BASE_URL = "https://rso2telkomdashboard.web.app";

console.log(
  `[${new Date().toISOString()}] [run:${RUN_ID}] Debug: email & password (REMOVE IN PROD)`
);
console.log(`[${new Date().toISOString()}] [run:${RUN_ID}] EMAIL: ${EMAIL}`);
console.log(
  `[${new Date().toISOString()}] [run:${RUN_ID}] PASSWORD: ${PASSWORD}`
); // BE CAREFUL - remove after debugging

// ====== SCHEDULE WINDOW (keep or comment out for testing) ======
const now = new Date();
const timestamp = now.toISOString();
const utcHour = now.getUTCHours();
const utcDay = now.getUTCDay(); // Monday = 1, Friday = 5
const isScheduledDay = utcDay === 1 || utcDay === 5;
const isInTimeWindow = utcHour >= 6 && utcHour < 11; // 06:00-11:00 UTC => 13:00-18:00 WIB

console.log(`[${timestamp}] ⏰ Triggering Telegram report automation...`);
if (!(isScheduledDay && isInTimeWindow)) {
  console.log(
    `⏹️ Not within scheduled time window (Mon/Fri >13:00 WIB). Skipping.`
  );
  // Comment out the next line while debugging locally if needed:
  // process.exit(0);
}

// ====== MAIN ======
export const sendScheduledReports = async () => {
  console.log(
    `[${new Date().toISOString()}] [run:${RUN_ID}] Starting sendScheduledReports()`
  );

  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS === "false" ? false : true, // set HEADLESS=false in env for local debugging
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();

  // Pipe page console messages into Node logs
  page.on("console", (msg) => {
    try {
      console.log(`[PAGE ${msg.type()}] ${msg.text()}`);
    } catch (e) {
      console.log(`[PAGE] console event parse error`);
    }
  });

  // Log network requests that look related to auth/login (or all if you want)
  page.on("request", (req) => {
    try {
      const url = req.url();
      const method = req.method();
      // Keep it focused: only auth-ish endpoints (tweak keywords as needed)
      if (
        /auth|login|signin|token|session|firebase|identitytoolkit/i.test(url)
      ) {
        console.log(`[REQ] ${method} ${url}`);
      }
    } catch (e) {}
  });

  try {
    console.log("🌐 Navigating to login page...");
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: "networkidle2",
      timeout: 45000,
    });

    // Wait for inputs to be present
    console.log("⌛ Waiting for email/password inputs...");
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.waitForSelector('input[type="password"]', { timeout: 15000 });

    // Debug: read existing input placeholders / values and print
    const emailPlaceholder = await page.$eval(
      'input[type="email"]',
      (el) => el.placeholder || ""
    );
    const passPlaceholder = await page.$eval(
      'input[type="password"]',
      (el) => el.placeholder || ""
    );
    console.log(
      `[DBG] email placeholder="${emailPlaceholder}", pass placeholder="${passPlaceholder}"`
    );

    console.log("⌨️ Setting email and password (React-friendly)...");
    await page.$eval(
      'input[type="email"]',
      (el, value) => {
        el.focus();
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
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
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.blur();
      },
      PASSWORD
    );

    // Confirm values are set (read back)
    const typedEmail = await page.$eval(
      'input[type="email"]',
      (el) => el.value
    );
    const typedPass = await page.$eval(
      'input[type="password"]',
      (el) => el.value
    );
    console.log(`[DBG] typedEmail="${typedEmail}"`);
    console.log(`[DBG] typedPass="${typedPass}"`);

    // small grace so client handlers start
    await new Promise((res) => setTimeout(res, 500));

    console.log("🔘 Clicking login button (in-page click)...");
    const clicked = await page
      .$$eval("#login-btn", (els) => {
        if (!els || els.length === 0) return false;
        // If the button is a custom component, ensure we click the first clickable descendant
        const btn = els[0];
        btn.click();
        return true;
      })
      .catch(() => false);

    if (!clicked) {
      console.log(
        "[DBG] #login-btn not found or click failed — fallback searching visible buttons"
      );
      await page
        .$$eval("button, a[role='button']", (els) => {
          const match = els.find((el) =>
            /login|sign ?in|sign ?up/i.test(el.innerText || "")
          );
          if (match) match.click();
        })
        .catch(() => {});
    }

    // right after click, print cookies & localStorage snapshot (helpful)
    await new Promise((res) => setTimeout(res, 800));
    const cookiesPostClick = await page.cookies().catch(() => []);
    console.log(
      `[DBG] cookies after click: ${JSON.stringify(cookiesPostClick)}`
    );

    const localStorageKeysBefore = await page.evaluate(() =>
      Object.keys(localStorage)
    );
    console.log(
      `[DBG] localStorage keys after click: ${JSON.stringify(
        localStorageKeysBefore
      )}`
    );

    // Robust wait: any of these -> success
    try {
      await Promise.race([
        page.waitForSelector("div.page.overview", { timeout: 45000 }),
        page.waitForFunction(
          () => window.location.pathname.includes("/overview"),
          { timeout: 45000 }
        ),
        page.waitForFunction(
          () => {
            // detect firebase auth localStorage keys or token keywords
            try {
              return Object.keys(localStorage).some((k) =>
                /firebase|auth|token|idToken|accessToken/i.test(k)
              );
            } catch (e) {
              return false;
            }
          },
          { timeout: 45000 }
        ),
        page.waitForFunction(
          () => {
            // detect any non-empty cookies as a sign auth set something
            try {
              return document.cookie && document.cookie.length > 0;
            } catch (e) {
              return false;
            }
          },
          { timeout: 45000 }
        ),
      ]);
    } catch (loginWaitErr) {
      // capture debug artifacts
      const safeTime = timestamp.replace(/[:.]/g, "-");
      const pngName = `debug-post-login-${safeTime}.png`;
      const htmlName = `debug-post-login-${safeTime}.html`;
      console.log(
        `[ERR] login wait timed out — saving debug artifacts: ${pngName}, ${htmlName}`
      );

      await page.screenshot({ path: pngName, fullPage: true }).catch(() => {});
      const html = await page.content().catch(() => "<no-html>");
      fs.writeFileSync(htmlName, html);

      // Dump localStorage keys and first 100 chars of each key's value for inspection
      const lsDump = await page
        .evaluate(() => {
          const out = {};
          try {
            for (const k of Object.keys(localStorage)) {
              out[k] = localStorage.getItem(k);
            }
          } catch (e) {}
          return out;
        })
        .catch(() => ({}));
      const lsDumpPath = `debug-localstorage-${safeTime}.json`;
      fs.writeFileSync(lsDumpPath, JSON.stringify(lsDump, null, 2));

      // Read generic visible error texts
      const loginErrorText = await page
        .$$eval(
          ".error, .error-msg, .toast-error, .notification--error, .ant-message, .MuiAlert-root, .toast, .alert",
          (els) => els.map((e) => e.innerText).join(" | ")
        )
        .catch(() => "");

      console.log(`[ERR] visible error text: ${loginErrorText}`);

      throw new Error(
        `Login did not reach overview within 45s. ${
          loginErrorText ? "Visible error: " + loginErrorText : ""
        }`
      );
    }

    console.log("✅ Logged in successfully (detected).");

    // For extra visibility, print final localStorage keys & cookies
    const lsFinal = await page
      .evaluate(() => Object.keys(localStorage))
      .catch(() => []);
    const cookiesFinal = await page.cookies().catch(() => []);
    console.log(`[DBG] localStorage keys final: ${JSON.stringify(lsFinal)}`);
    console.log(`[DBG] cookies final: ${JSON.stringify(cookiesFinal)}`);

    // === proceed with your report pages
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
        timeout: 45000,
      });

      try {
        console.log(`🔍 Waiting for ${buttonId}...`);
        await page.waitForSelector(buttonId, { timeout: 15000 });

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
    try {
      const safeTime = timestamp.replace(/[:.]/g, "-");
      await page
        .screenshot({ path: `debug-${safeTime}.png`, fullPage: true })
        .catch(() => {});
      const html = await page.content().catch(() => "<no-html>");
      fs.writeFileSync(`debug-${safeTime}.html`, html);
    } catch (e) {}
  } finally {
    await browser.close();
    console.log(
      `[${new Date().toISOString()}] [run:${RUN_ID}] [pid:${PID}] finished`
    );
  }
};

// Auto-run only when executed directly (ESM-safe)
if (import.meta.url === `file://${process.argv[1]}`) {
  sendScheduledReports();
}
