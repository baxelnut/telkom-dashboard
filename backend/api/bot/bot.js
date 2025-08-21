import bot from "./botInstance.js";
import { db } from "../firebaseAdmin.js";

// helper
async function findUserById(telegramId) {
  if (!telegramId) return null;

  const snapshot = await db
    .collection("users")
    .where("telegramId", "==", String(telegramId))
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, data: snapshot.docs[0].data() };
}

// register handlers (these MUST run when the module is imported)
bot.start(async (ctx) => {
  const telegramId = String(ctx.from?.id || "");

  if (process.env.NODE_ENV === "development" && telegramId !== "1360015931") {
    return ctx.reply(
      `🚫 This bot is in dev mode and locked to 1360015931. \n ${telegramId}`
    );
  }

  const match = await findUserById(telegramId);
  if (!match || !match.data.telegramId) {
    return ctx.reply(
      `❌ No linked account found for @${telegramId}.\n➡️ Go to Dashboard → Settings → Connect Telegram and set your username exactly as @${telegramId}`
    );
  }

  try {
    await db
      .collection("users")
      .doc(match.id)
      .update({
        teleChatId: ctx.chat?.id ?? null,
      });
  } catch (e) {
    console.warn("Failed to save teleChatId:", e.message || e);
  }

  await ctx.reply(`👋 Welcome ${match.data.fullName || "User"}!`);
  await ctx.reply(
    "Here are your available commands:\n/report - Get latest orders\n/alerts - Manage alerts"
  );
});

bot.command("test", async (ctx) => {
  const telegramId = ctx.from?.id || null;
  const match = await findUserById(telegramId);

  ctx.reply(
    `🛠 Debug:\n` +
      `Telegram ID: ${telegramId || "(none)"}\n` +
      `Matched in DB: ${match ? "✅ YES" : "❌ NO"}\n` +
      (match
        ? `Full name: ${match.data.fullName}\nRole: ${match.data.role}\nStored telegramId: ${match.data.telegramId}`
        : "")
  );
});

// export the bot (so webhook route can import it with handlers attached)
export default bot;

// helper to start polling in dev
export async function startBot() {
  if (process.env.NODE_ENV === "production") {
    console.log("✅ Bot ready for WEBHOOK (Vercel).");
    return;
  }
  try {
    await bot.launch({ dropPendingUpdates: true });
    console.log("✅ Bot started in POLLING mode (local dev).");
  } catch (err) {
    console.error("❌ Bot failed to launch (polling):", err);
  }
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
