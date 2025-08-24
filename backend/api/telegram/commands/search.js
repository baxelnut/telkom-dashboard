export default async function handleSearch({
  db,
  axios,
  telegramId,
  chatId,
  TELEGRAM_API,
  args,
}) {
  if (args.length === 0) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text:
        "Please provide a search query after the command, e.g., `/search <po_id>` or `/search <customer_name>`." +
        "\n\nUse /help to show commands",
    });
    return;
  }

  const query = args.join(" ");

  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: `Searching for "${query}". Please wait...`,
  });

  try {
    const resp = await axios.get(
      `${process.env.API_BASE_URL}/api/regional-3/search/by-query`,
      {
        params: { query: query, telegramId: String(telegramId) },
      }
    );

    const data = resp.data;
    if (!data || data.results.length === 0) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `No results found for "${query}".`,
      });
      return;
    }

    // Craft a professional, compact response for the search results
    const resultsMsg = data.results
      .map(
        (item) =>
          `*ID:* ${item.id}\n` +
          `*Customer:* ${item.customerName}\n` +
          `*Status:* ${item.status}\n` +
          `*Details:* ${item.description || "N/A"}\n`
      )
      .join("\n\n");

    const responseText = `**Search Results for "${query}":**\n\n${resultsMsg}`;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: responseText,
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.error(
      "SEARCH -> error",
      err?.response?.data || err?.message || err
    );
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Failed to perform the search. Please ensure the query is correct and try again later.",
    });
  }
}
