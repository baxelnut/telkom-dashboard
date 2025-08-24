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
        text: "Active alerts listing not available yet. Dashboard only.",
      });
      return;

    case "/alertadd":
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "Add-alert flow not implemented yet. Use dashboard to create alerts.",
      });
      return;

    case "/alert":
    default:
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text:
          "🔔 Alert Management\n\nUsage:\n" +
          "/alertlist - View active alerts\n" +
          "/alertadd - Create a new alert\n\n" +
          "Coming soon to Telegram. For now, use the dashboard." +
          "\n\nUse /help to show commands",
        parse_mode: "Markdown",
      });
      return;
  }
}
