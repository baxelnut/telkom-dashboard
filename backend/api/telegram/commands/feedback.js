const PENDING_FEEDBACK = new Map();
// key: telegramId, value: { chatId, startedAt }

export default async function handleFeedback({
  db,
  axios,
  telegramId,
  chatId,
  TELEGRAM_API,
  args,
  message,
}) {
  const feedbackText = args.join(" ").trim();

  // User typed just "/feedback" → start flow
  if (!feedbackText && !PENDING_FEEDBACK.has(telegramId)) {
    PENDING_FEEDBACK.set(telegramId, { chatId, startedAt: Date.now() });

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "✍️ Please enter your feedback now. Just type your message and send it.",
      parse_mode: "HTML",
    });
    return;
  }

  // User already in feedback mode and sends any message
  if (PENDING_FEEDBACK.has(telegramId) && !feedbackText) {
    const session = PENDING_FEEDBACK.get(telegramId);
    PENDING_FEEDBACK.delete(telegramId);

    const userFeedback = message?.text?.trim();
    if (!userFeedback) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "⚠️ I didn't catch any text. Feedback cancelled.",
      });
      return;
    }

    // Save to Firestore
    const feedbackRef = db.collection("feedback").doc();
    await feedbackRef.set({
      telegramId,
      chatId: session.chatId,
      feedback: userFeedback,
      createdAt: new Date(),
    });

    // Notify admin / developer
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
    if (ADMIN_CHAT_ID) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: ADMIN_CHAT_ID,
        text: `📩 New feedback from <b>${telegramId}</b>:\n\n${userFeedback}`,
        parse_mode: "HTML",
      });
    }

    // Confirm to user
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "✅ Thanks for your feedback! We're building this with you 🚀",
      parse_mode: "HTML",
    });
    return;
  }

  // Inline feedback still works → "/feedback your text here"
  if (feedbackText) {
    const feedbackRef = db.collection("feedback").doc();
    await feedbackRef.set({
      telegramId,
      chatId,
      feedback: feedbackText,
      createdAt: new Date(),
    });

    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
    if (ADMIN_CHAT_ID) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: ADMIN_CHAT_ID,
        text: `📩 New feedback from <b>${telegramId}</b>:\n\n${feedbackText}`,
        parse_mode: "HTML",
      });
    }

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "✅ Thanks for your feedback! We're building this with you 🚀",
      parse_mode: "HTML",
    });
  }
}
