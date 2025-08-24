export default async function handleAlert({
  axios,
  chatId,
  TELEGRAM_API,
  commandText,
  args,
}) {
  switch (commandText) {
    case "/alertlist":
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "<b>Active Alerts</b>\n\n<i>Listing not available yet. Please check the dashboard.</i>",
        parse_mode: "HTML",
      });
      return;

    case "/alertadd":
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "<b>Add New Alert</b>\n\n<i>This flow is not implemented yet. Use the dashboard to create alerts.</i>",
        parse_mode: "HTML",
      });
      return;

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
