// import fs from "fs";
// import path from "path";
// import axios from "axios";
// import FormData from "form-data";
// import puppeteer from "puppeteer";

// const BASE_URL =
//   process.env.API_BASE_URL || "https://rso2telkomdashboard.web.app";
// const EMAIL = process.env.TELKOM_DASHBOARD_EMAIL;
// const PASSWORD = process.env.TELKOM_DASHBOARD_PASSWORD;
// const CHAT_ID = process.env.CHAT_ID || process.env.TELEGRAM_CHAT_ID;
// const TELEGRAM_API = `https://api.telegram.org/bot${(
//   process.env.TELEGRAM_BOT_TOKEN || ""
// ).trim()}`;

// if (!process.env.TELEGRAM_BOT_TOKEN) {
//   console.error("Missing TELEGRAM_BOT_TOKEN");
//   process.exit(1);
// }
// if (!CHAT_ID) {
//   console.error("Missing CHAT_ID input");
//   process.exit(1);
// }
// if (!EMAIL || !PASSWORD) {
//   console.error("Missing TELKOM_DASHBOARD_EMAIL/PASSWORD");
//   process.exit(1);
// }

// const TABLES = (process.env.TABLES || "aosodomoro,galaksi")
//   .split(",")
//   .map((s) => s.trim().toLowerCase())
//   .filter(Boolean);

// const TABLE_CONF = {
//   aosodomoro: {
//     path: "/reports/aosodomoro",
//     sel: ".aosodomoro-table table",
//     name: "Aosodomoro",
//   },
//   galaksi: {
//     path: "/reports/galaksi",
//     sel: ".galaksi-table table",
//     name: "Galaksi",
//   },
// };

// async function sendTelegramText(text) {
//   try {
//     await axios.post(`${TELEGRAM_API}/sendMessage`, {
//       chat_id: CHAT_ID,
//       text,
//       parse_mode: "HTML",
//     });
//   } catch {}
// }

// async function sendTelegramPhoto(filePath, caption) {
//   const form = new FormData();
//   form.append("chat_id", CHAT_ID);
//   form.append("photo", fs.createReadStream(filePath));
//   if (caption) form.append("caption", caption);
//   try {
//     await axios.post(`${TELEGRAM_API}/sendPhoto`, form, {
//       headers: form.getHeaders(),
//       maxContentLength: Infinity,
//       maxBodyLength: Infinity,
//     });
//   } finally {
//     try {
//       fs.unlinkSync(filePath);
//     } catch {}
//   }
// }

// async function humanType(page, selector, text) {
//   await page.$eval(selector, (el) => el.scrollIntoView({ block: "center" }));
//   await page.focus(selector);
//   try {
//     await page.keyboard.down("Control");
//     await page.keyboard.press("KeyA");
//     await page.keyboard.up("Control");
//   } catch {
//     await page.$eval(selector, (el) => (el.value = ""));
//   }
//   await page.keyboard.press("Backspace");
//   await page.keyboard.type(text, { delay: 50 });
//   await page.$eval(selector, (el) => el.blur());
// }

// // html2canvas-based screenshot (isolates table, no header/other UI)
// async function screenshotElement(page, selector, filepath) {
//   const elHandle = await page.$(selector);
//   if (!elHandle) throw new Error(`Selector not found: ${selector}`);

//   // Ensure table is fully expanded (in-page)
//   await page.evaluate((sel) => {
//     const el = document.querySelector(sel);
//     if (!el) return;
//     el.style.overflow = "visible";
//     el.style.maxHeight = "none";
//     el.style.maxWidth = "none";
//     // ensure no transforms that could affect capture
//     el.style.transform = el.style.transform || "none";
//   }, selector);

//   // Inject html2canvas if not present
//   const hasHtml2 = await page.evaluate(() => !!window.html2canvas);
//   if (!hasHtml2) {
//     await page.addScriptTag({
//       url: "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
//     });
//     await new Promise((r) => setTimeout(r, 500));
//   }

//   // Wait for fonts to be ready (avoid fallback fonts)
//   await page.evaluateHandle("document.fonts.ready");

//   // Run html2canvas in page context while hiding everything except the table ancestors
//   const dataUrl = await page.evaluate(async (sel) => {
//     const table = document.querySelector(sel);
//     if (!table) throw new Error("Table not found in page.evaluate");

//     // Collect ancestors up to body
//     const ancestors = new Set();
//     let n = table;
//     while (n && n !== document.documentElement) {
//       ancestors.add(n);
//       n = n.parentNode;
//     }
//     ancestors.add(document.body);

//     // Hide everything in body that is NOT an ancestor of the table (preserve ancestor chain)
//     const originalDisplays = [];
//     for (const child of Array.from(document.body.children)) {
//       if (!ancestors.has(child)) {
//         originalDisplays.push({ el: child, prev: child.style.display || "" });
//         child.style.display = "none";
//       }
//     }

//     // Make sure table's ancestors don't clip the table
//     for (const anc of ancestors) {
//       if (anc && anc.style) {
//         anc.style.overflow = "visible";
//         anc.style.maxHeight = "none";
//         anc.style.maxWidth = "none";
//       }
//     }

//     // Small layout tick
//     await new Promise((r) => setTimeout(r, 120));

//     // Scroll table to top-left of viewport to avoid weird offsets
//     table.scrollIntoView({ block: "start", inline: "start" });

//     // Render using html2canvas — use devicePixelRatio for sharpness, enable useCORS
//     const scale = window.devicePixelRatio || 2;
//     const canvas = await window.html2canvas(table, {
//       scale,
//       useCORS: true,
//       backgroundColor: "#ffffff",
//       logging: false,
//     });

//     const url = canvas.toDataURL("image/png");

//     // Restore hidden elements' display
//     for (const item of originalDisplays) {
//       try {
//         item.el.style.display = item.prev || "";
//       } catch {}
//     }

//     // Return the dataURL
//     return url;
//   }, selector);

//   // Write the returned base64 dataURL to file
//   const base64 = dataUrl.split(",")[1];
//   if (!base64) throw new Error("Invalid data url from html2canvas");
//   fs.writeFileSync(filepath, Buffer.from(base64, "base64"));
// }

// (async () => {
//   console.log("🔥 Capture run at:", new Date().toISOString());

//   const browser = await puppeteer.launch({
//     headless: "new",
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-dev-shm-usage",
//     ],
//   });
//   const page = await browser.newPage();
//   await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });
//   page.setDefaultNavigationTimeout(120000);

//   try {
//     // Login
//     console.log("🌐 goto /login");
//     await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
//     await page.waitForSelector('input[type="email"]', { timeout: 20000 });
//     await page.waitForSelector('input[type="password"]', { timeout: 20000 });

//     console.log("⌨️ typing creds");
//     await humanType(page, 'input[type="email"]', EMAIL);
//     await new Promise((r) => setTimeout(r, 500));
//     await humanType(page, 'input[type="password"]', PASSWORD);
//     await new Promise((r) => setTimeout(r, 800));

//     await page.$eval("#login-btn", (el) => el.click());
//     await Promise.race([
//       page.waitForFunction(() => location.pathname.includes("/overview"), {
//         timeout: 45000,
//       }),
//       page.waitForSelector("div.page.overview", { timeout: 45000 }),
//     ]).catch(() => {});
//     console.log("✅ logged in");

//     // Capture each table
//     for (const key of TABLES) {
//       const t = TABLE_CONF[key];
//       if (!t) continue;

//       console.log(`📄 goto ${t.path}`);
//       await page.goto(`${BASE_URL}${t.path}`, { waitUntil: "networkidle2" });

//       console.log(`🔍 wait ${t.sel}`);
//       await page.waitForSelector(t.sel, { timeout: 45000 });
//       await page.$eval(t.sel, (el) => el.scrollIntoView({ block: "center" }));
//       await new Promise((r) => setTimeout(r, 800));

//       const file = path.join(process.cwd(), `capture-${key}-${Date.now()}.png`);
//       await screenshotElement(page, t.sel, file);
//       console.log(`💾 saved ${file}`);

//       await sendTelegramPhoto(file, `📊 ${t.name} Table`);
//     }

//     await sendTelegramText("✅ All done");
//   } catch (e) {
//     console.error("❌ Capture failed:", e);
//     await sendTelegramText(`❌ Failed: ${e.message || e}`);
//     process.exit(1);
//   } finally {
//     await browser.close();
//   }
// })();
