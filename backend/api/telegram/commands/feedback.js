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
  const text = message?.text?.trim() || "";
  const feedbackText = args.join(" ").trim();

  // 1️⃣ User already in pending feedback mode → capture any message
  if (PENDING_FEEDBACK.has(telegramId)) {
    const session = PENDING_FEEDBACK.get(telegramId);
    PENDING_FEEDBACK.delete(telegramId);

    if (!text) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "⚠️ I didn't catch any text. Feedback cancelled.",
      });
      return;
    }

    // Save feedback
    const feedbackRef = db.collection("feedback").doc();
    await feedbackRef.set({
      telegramId,
      chatId: session.chatId,
      feedback: text,
      createdAt: new Date(),
    });

    // Notify admin
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
    if (ADMIN_CHAT_ID) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: ADMIN_CHAT_ID,
        text: `📩 New feedback from <b>${telegramId}</b>:\n\n${text}`,
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

  // 2️User types `/feedback some text` → inline feedback
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
    return;
  }

  // 3️User typed `/feedback` → start pending session
  if (!feedbackText) {
    PENDING_FEEDBACK.set(telegramId, { chatId, startedAt: Date.now() });

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "✍️ Please enter your feedback now. Just type your message and send it.",
      parse_mode: "HTML",
    });
    return;
  }
}
