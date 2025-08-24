export default async function handleStart({
  db,
  axios,
  telegramId,
  chatId,
  TELEGRAM_API,
  commandList,
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
