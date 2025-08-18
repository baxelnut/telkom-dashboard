import bot from "./botInstance.js";
import { db } from "../firebaseAdmin.js";

// helper
async function findUserByUsername(username) {
  if (!username) return null;
  const snapshot = await db
    .collection("users")
    .where("telegramId", "==")
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, data: snapshot.docs[0].data() };
}

// register handlers (these MUST run when the module is imported)
bot.start(async (ctx) => {
  const tgUsername = ctx.from?.username || null;
  if (!tgUsername) {
    return ctx.reply(
      "❌ Your Telegram account has no username set.\nPlease set a Telegram username in Telegram settings and link it in the dashboard."
    );
  }

  if (
    process.env.NODE_ENV === "development" &&
    tgUsername !== "basiliustengang"
  ) {
    return ctx.reply(
      "🚫 This bot is in dev mode and locked to @basiliustengang."
    );
  }

  const match = await findUserByUsername(tgUsername);
  if (!match || !match.data.telegramId) {
    return ctx.reply(
      `❌ No linked account found for @${tgUsername}.\n➡️ Go to Dashboard → Settings → Connect Telegram and set your username exactly as @${tgUsername}`
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
  const tgUsername = ctx.from?.username || null;
  const match = await findUserByUsername(tgUsername);

  ctx.reply(
    `🛠 Debug:\n` +
      `Telegram username: @${tgUsername || "(none)"}\n` +
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
