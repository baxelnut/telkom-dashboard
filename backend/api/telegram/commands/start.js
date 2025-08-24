export default async function handleStart({
  db,
  axios,
  telegramId,
  chatId,
  TELEGRAM_API,
}) {
  const snap = await db
    .collection("users")
    .where("telegramId", "==", String(telegramId))
    .limit(1)
    .get();

  if (snap.empty) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "No linked account found. Please go to the Dashboard to connect your Telegram account.",
    });
    return;
  }

  const userDoc = snap.docs[0];
  const user = userDoc.data();

  await db
    .collection("users")
    .doc(userDoc.id)
    .update({ teleChatId: chatId })
    .catch(() => {});

  const keyboard = {
    inline_keyboard: [
      [{ text: "Get Report", callback_data: "/report" }],
      [{ text: "Manage Alerts", callback_data: "/alert" }],
      [
        {
          text: "Go to Dashboard",
          url: "https://rso2telkomdashboard.web.app",
        },
      ],
    ],
  };

  const commandList =
    "**Available Commands:**\n\n" +
    "/start - Displays a welcome message and a list of available commands.\n" +
    "/report - Provides a summary report of key metrics.\n" +
    "   /report<witelcode> - Get a summary for a specific WITEL.\n" +
    "   /reportlastweek - Get a report for the last 7 days.\n" +
    "   /reportlastmonth - Get a report for the last 30 days.\n" +
    "/alert - Manages alert notifications.\n" +
    "   /alertlist - Shows all active alerts.\n" +
    "   /alertadd - Initiates a flow to create a new alert.\n" +
    "/search<poid> - Finds a specific Purchase Order by ID.\n" +
    "/summaryinprocess - Provides a breakdown of all orders currently 'IN PROCESS'.\n" +
    "/summarybywitel - Shows a quick summary of orders by WITEL.\n" +
    "/help - Displays this comprehensive list of commands and their usage.";

  const welcomeMessage = `👋 Welcome, **${
    user.fullName || "User"
  }**. Thank you for using the Telkom Regional Dashboard reporting service.`;

  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: `${welcomeMessage}\n\n${commandList}`,
    reply_markup: keyboard,
    parse_mode: "Markdown",
  });
}
