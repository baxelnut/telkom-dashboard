export default async function handleAlert({
  axios,
  chatId,
  TELEGRAM_API,
  commandText,
  args,
}) {
  switch (commandText) {
    case "/alert":
    default:
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text:
          "🔔 <b>Alert Management</b>\n\n" +
          "/alertlist – View active alerts\n" +
          "/alertadd – Create a new alert\n\n" +
          "<i>Coming soon to Telegram. For now, use the dashboard.</i>\n\n" +
          "Use /help to show all commands.",
        parse_mode: "HTML",
      });
      return;
  }
}
