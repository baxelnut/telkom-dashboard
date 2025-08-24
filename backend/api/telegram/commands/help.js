export default async function handleHelp({ axios, chatId, TELEGRAM_API }) {
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

  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: commandList,
    parse_mode: "Markdown",
  });
}
