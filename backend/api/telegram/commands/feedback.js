export default async function handleFeedback({
  db,
  axios,
  telegramId,
  chatId,
  TELEGRAM_API,
  args,
}) {
  const feedbackText = args.join(" ").trim();

  if (!feedbackText) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Please provide your feedback after the command.\n\nExample:\n/feedback Bot ini membingungkan 😅",
      parse_mode: "HTML",
    });
    return;
  }

  // Save to Firestore
  const feedbackRef = db.collection("feedback").doc();
  await feedbackRef.set({
    telegramId,
    chatId,
    feedback: feedbackText,
    createdAt: new Date(),
  });

  // Notify admin / developer
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
  if (ADMIN_CHAT_ID) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: ADMIN_CHAT_ID,
      text: `📩 New feedback from <b>${telegramId}</b>:\n\n${feedbackText}`,
      parse_mode: "HTML",
    });
  }

  // Reply to user
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: "✅ Thanks for your feedback! We're building this with you 🚀",
    parse_mode: "HTML",
  });
}
