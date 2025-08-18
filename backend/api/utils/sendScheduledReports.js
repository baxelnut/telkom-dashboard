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
    `[${new Date().toISOString()}] [run:${RUN_ID}] Duplicate run detected — exiting.`
  );
  console.trace();
  process.exit(0);
}
globalThis.__SEND_SCHEDULED_REPORTS_LOCK__ = true;

// CONFIG
const EMAIL = process.env.TELKOM_DASHBOARD_EMAIL;
const PASSWORD = process.env.TELKOM_DASHBOARD_PASSWORD;
const BASE_URL = "https://rso2telkomdashboard.web.app";

console.log(`[DBG] EMAIL: ${EMAIL}`);
console.log(`[DBG] PASSWORD: ${PASSWORD}`); // remove after debugging!

const now = new Date();
const timestamp = now.toISOString();
const utcHour = now.getUTCHours();
const utcDay = now.getUTCDay(); // Monday = 1, Friday = 5
const isScheduledDay = utcDay === 1 || utcDay === 5;
const isInTimeWindow = utcHour >= 6 && utcHour < 11; // 06:00-11:00 UTC => 13:00-18:00 WIB

console.log(`[${timestamp}] ⏰ Triggering Telegram report automation...`);
// Comment this next block temporarily during debugging if you want to run outside scheduled times
if (!(isScheduledDay && isInTimeWindow)) {
  console.log(
    "⏹️ Not within scheduled time window (Mon/Fri >13:00 WIB). Skipping."
  );
  // process.exit(0);
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

  // capture page console
  page.on("console", (msg) => {
    try {
      console.log(`[PAGE ${msg.type()}] ${msg.text()}`);
    } catch (e) {}
  });

  // log requests/responses for auth-like URLs
  page.on("request", (req) => {
    const url = req.url();
    if (
      /auth|login|signin|token|session|identitytoolkit|firebase|accounts.google/i.test(
        url
      )
    ) {
      console.log(`[REQ] ${req.method()} ${url}`);
    }
  });

  page.on("response", async (res) => {
    try {
      const url = res.url();
      if (
        /auth|login|signin|token|session|identitytoolkit|firebase|accounts.google/i.test(
          url
        )
      ) {
        let shortBody = "";
        try {
          const text = await res.text();
          shortBody = text.slice(0, 800).replace(/\n/g, " ");
        } catch (e) {
          shortBody = "<unable-to-read-body>";
        }
        console.log(`[RES] ${res.status()} ${url} => ${shortBody}`);
      }
    } catch (e) {}
  });

  try {
    console.log("🌐 Navigating to login page...");
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("⌛ Waiting for inputs...");
    await page.waitForSelector('input[type="email"]', { timeout: 20000 });
    await page.waitForSelector('input[type="password"]', { timeout: 20000 });

    // debug placeholders
    const placeholders = await page.evaluate(() => {
      const e = document.querySelector('input[type="email"]');
      const p = document.querySelector('input[type="password"]');
      return {
        emailPlaceholder: e?.placeholder || "",
        passPlaceholder: p?.placeholder || "",
      };
    });
    console.log(`[DBG] placeholders:`, placeholders);

    // set values React-friendly
    console.log("⌨️ Setting values (React-friendly)...");
    await page.$eval(
      'input[type="email"]',
      (el, v) => {
        el.focus();
        el.value = v;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.blur();
      },
      EMAIL
    );
    await page.$eval(
      'input[type="password"]',
      (el, v) => {
        el.focus();
        el.value = v;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.blur();
      },
      PASSWORD
    );

    // confirm values inserted
    const inserted = await page.evaluate(() => {
      const e = document.querySelector('input[type="email"]')?.value || "";
      const p = document.querySelector('input[type="password"]')?.value || "";
      return { email: e, passLen: p.length };
    });
    console.log(
      `[DBG] inserted email="${inserted.email}" passLen=${inserted.passLen}`
    );

    // gather button info
    const btnInfo = await page.evaluate(() => {
      const el = document.querySelector("#login-btn");
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        outerHTML: el.outerHTML,
        disabled: el.disabled || el.getAttribute("aria-disabled") || false,
        classes: el.className || null,
        rect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        visible:
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden",
      };
    });

    console.log(`[DBG] login-btn: ${btnInfo ? "FOUND" : "NOT FOUND"}`);
    if (btnInfo) {
      console.log(`[DBG] outerHTML: ${btnInfo.outerHTML}`);
      console.log(
        `[DBG] disabled: ${btnInfo.disabled}, visible: ${btnInfo.visible}, classes: ${btnInfo.classes}`
      );
      console.log(`[DBG] rect: ${JSON.stringify(btnInfo.rect)}`);
    } else {
      console.log("[DBG] #login-btn not found in DOM.");
    }

    // If login button exists, find center coordinates and inspect elementFromPoint
    if (btnInfo && btnInfo.visible) {
      const cx = Math.round(btnInfo.rect.left + btnInfo.rect.width / 2);
      const cy = Math.round(btnInfo.rect.top + btnInfo.rect.height / 2);

      // element that would receive pointer
      const elAtPointBefore = await page.evaluate(
        (x, y) => {
          const el = document.elementFromPoint(x, y);
          return el
            ? { tag: el.tagName, outerHTML: el.outerHTML.slice(0, 400) }
            : null;
        },
        cx,
        cy
      );
      console.log(
        `[DBG] elementFromPoint(before): ${JSON.stringify(elAtPointBefore)}`
      );

      // Try in-page click first (should call React handler)
      console.log("[DBG] Trying el.click() on #login-btn");
      const clickedInPage = await page
        .$eval("#login-btn", (el) => {
          try {
            el.click();
            return true;
          } catch (e) {
            return false;
          }
        })
        .catch(() => false);
      console.log(`[DBG] el.click() returned: ${clickedInPage}`);

      // small delay
      await new Promise((res) => setTimeout(res, 700));

      // If no network auth observed, try mouse click at center
      console.log("[DBG] Trying page.mouse.click at button center");
      try {
        await page.mouse.move(cx, cy, { steps: 6 });
        await page.mouse.click(cx, cy);
      } catch (e) {
        console.log("[DBG] page.mouse.click failed:", e.message);
      }

      await new Promise((res) => setTimeout(res, 700));

      const elAtPointAfter = await page.evaluate(
        (x, y) => {
          const el = document.elementFromPoint(x, y);
          return el
            ? { tag: el.tagName, outerHTML: el.outerHTML.slice(0, 400) }
            : null;
        },
        cx,
        cy
      );
      console.log(
        `[DBG] elementFromPoint(after): ${JSON.stringify(elAtPointAfter)}`
      );
    } else {
      // fallback: try to find any button with "login" text and click it
      console.log("[DBG] Fallback: click visible button with login text");
      const fallbackClicked = await page
        .$$eval("button, a[role='button']", (els) => {
          const found = els.find((el) =>
            /login|sign ?in|sign ?up/i.test(el.innerText || "")
          );
          if (found) {
            try {
              found.click();
              return true;
            } catch (e) {
              return false;
            }
          }
          return false;
        })
        .catch(() => false);
      console.log(`[DBG] fallbackClicked: ${fallbackClicked}`);
    }

    // small wait then try pressing Enter in password field (some forms submit on Enter)
    await new Promise((res) => setTimeout(res, 800));
    console.log("[DBG] Pressing Enter in password field as fallback");
    try {
      await page.focus('input[type="password"]');
      await page.keyboard.press("Enter");
    } catch (e) {
      console.log("[DBG] Enter press failed:", e.message);
    }

    // Wait to detect a success condition:
    try {
      await Promise.race([
        page.waitForSelector("div.page.overview", { timeout: 30000 }),
        page.waitForFunction(
          () => window.location.pathname.includes("/overview"),
          { timeout: 30000 }
        ),
        page.waitForFunction(
          () => {
            try {
              return Object.keys(localStorage).some((k) =>
                /firebase|auth|token|idToken|accessToken|session/i.test(k)
              );
            } catch (e) {
              return false;
            }
          },
          { timeout: 30000 }
        ),
        page.waitForFunction(
          () => document.cookie && document.cookie.length > 0,
          { timeout: 30000 }
        ),
      ]);
    } catch (e) {
      // timed out -> dump debug artifacts
      const safeTime = new Date().toISOString().replace(/[:.]/g, "-");
      const png = `debug-post-login-${safeTime}.png`;
      const html = `debug-post-login-${safeTime}.html`;
      console.log(`[ERR] Login detection timed out. Saving ${png} and ${html}`);
      await page.screenshot({ path: png, fullPage: true }).catch(() => {});
      const pageHtml = await page.content().catch(() => "<no-html>");
      fs.writeFileSync(html, pageHtml);

      // dump localStorage keys & snippet
      const ls = await page
        .evaluate(() => {
          try {
            const out = {};
            for (const k of Object.keys(localStorage)) {
              out[k] =
                localStorage.getItem(k) &&
                localStorage.getItem(k).slice(0, 300);
            }
            return out;
          } catch (e) {
            return {};
          }
        })
        .catch(() => ({}));

      fs.writeFileSync(
        `debug-localstorage-${safeTime}.json`,
        JSON.stringify(ls, null, 2)
      );

      // dump cookie string
      const cookies = await page.cookies().catch(() => []);
      fs.writeFileSync(
        `debug-cookies-${safeTime}.json`,
        JSON.stringify(cookies, null, 2)
      );

      // visible error text
      const visibleErr = await page
        .$$eval(
          ".error, .error-msg, .toast-error, .notification--error, .ant-message, .MuiAlert-root, .toast, .alert",
          (els) => els.map((e) => e.innerText).join(" | ")
        )
        .catch(() => "");
      console.log(`[ERR] visible error text: ${visibleErr}`);

      throw new Error("Login did not reach overview within timeout.");
    }

    console.log("✅ Login detected. Continuing to reports...");

    // Optional: print final localStorage & cookies
    const finalLSKeys = await page
      .evaluate(() => Object.keys(localStorage))
      .catch(() => []);
    const finalCookies = await page.cookies().catch(() => []);
    console.log(
      `[DBG] final localStorage keys: ${JSON.stringify(finalLSKeys)}`
    );
    console.log(`[DBG] final cookies: ${JSON.stringify(finalCookies)}`);

    // proceed with report pages (your original loop)
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
          await new Promise((res) => setTimeout(res, 6000));
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

// auto-run only when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  sendScheduledReports();
}
