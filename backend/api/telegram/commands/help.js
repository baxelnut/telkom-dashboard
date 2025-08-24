export default async function handleHelp({ axios, chatId, TELEGRAM_API }) {
  const commandList =
    "**Available Commands:**\n\n" +
    "`/start` - Displays the welcome message and command list.\n\n" +
    "`/report` - Generates a summary report of key metrics. Can be used with specific parameters:\n" +
    "   - `/report <witel_code>`: Summary for a specific WITEL.\n" +
    "   - `/report last_week`: Report for the last 7 days.\n" +
    "   - `/report last_month`: Report for the last 30 days.\n\n" +
    "`/alert` - Manages alert notifications. Use with specific subcommands:\n" +
    "   - `/alert list`: View all active alerts.\n" +
    "   - `/alert add`: Initiate the process to create a new alert.\n\n" +
    "`/search` - Searches for specific data points.\n" +
    "   - `/search <po_id>`: Finds a Purchase Order by its ID.\n" +
    "   - `/search <customer_name>`: Finds POs by customer name.\n\n" +
    "`/help` - Displays this list of commands and their usage.";

  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: commandList,
    parse_mode: "Markdown",
  });
}
