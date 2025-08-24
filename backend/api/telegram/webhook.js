import { db } from "../firebaseAdmin.js";
import axios from "axios";
import handleStart from "./commands/start.js";
import handleReport from "./commands/report.js";
import handleAlert from "./commands/alert.js";
import handleSearch from "./commands/search.js";
import handleHelp from "./commands/help.js";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// In-memory dedupe
const seen = new Set();
const SEEN_LIMIT = 500;

const commandList =
  "**Available Commands:**\n\n" +
  "/report - Summary report\n" +
  "/reportwitel - Report by WITEL\n" +
  "/reportlastweek - Report last 7 days\n" +
  "/reportlastmonth - Report last 30 days\n" +
  "/alert - Manage alerts\n" +
  "/alertlist - Show alerts\n" +
  "/alertadd - Add new alert\n" +
  "/search - Search PO by ID\n" +
  "/help - Show commands";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const update = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  res.status(200).send("OK");

  try {
    const updateId = update?.update_id;
    const msg = update?.message;
    const text = msg?.text?.trim();
    const chatId = msg?.chat?.id;
    const telegramId = msg?.from?.id;

    if (!chatId || !text) return;

    if (updateId != null) {
      if (seen.has(updateId)) return;
      seen.add(updateId);
      if (seen.size > SEEN_LIMIT) {
        const first = seen.values().next().value;
        seen.delete(first);
      }
    }

    await axios
      .post(`${TELEGRAM_API}/sendChatAction`, {
        chat_id: chatId,
        action: "typing",
      })
      .catch(() => {});

    const [command, ...args] = text.split(" ");
    const commandText = command.toLowerCase();

    switch (commandText) {
      case "/start":
        await handleStart({
          db,
          axios,
          telegramId,
          chatId,
          TELEGRAM_API,
          commandList,
        });
        break;
      case "/report":
      case "/reportlastweek":
      case "/reportlastmonth":
        await handleReport({
          db,
          axios,
          telegramId,
          chatId,
          TELEGRAM_API,
          commandText,
          args,
        });
        break;
      case "/alert":
      case "/alertlist":
      case "/alertadd":
        await handleAlert({
          db,
          axios,
          telegramId,
          chatId,
          TELEGRAM_API,
          commandText,
          args,
        });
        break;
      case "/search":
        await handleSearch({
          db,
          axios,
          telegramId,
          chatId,
          TELEGRAM_API,
          args,
        });
        break;
      case "/help":
        await handleHelp({ axios, chatId, TELEGRAM_API, commandList });
        break;
      default:
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: "Unknown command. Please use /help for a list of available commands.",
        });
        break;
    }
  } catch (err) {
    console.error("Webhook error:", err?.response?.data || err.message || err);
  }
}
