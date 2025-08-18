import { Telegraf } from "telegraf";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TELEGRAM_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN");

const bot = new Telegraf(TELEGRAM_TOKEN);

export default bot;
