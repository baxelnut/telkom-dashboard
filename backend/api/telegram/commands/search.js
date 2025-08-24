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
        "Please provide a search query after the command, e.g., <code>/search &lt;po_id&gt;</code> or <code>/search &lt;customer_name&gt;</code>." +
        "\n\nUse <code>/help</code> to show commands",
      parse_mode: "HTML",
    });
    return;
  }

  const query = args.join(" ");

  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: `Searching for <b>"${query}"</b>. Please wait...`,
    parse_mode: "HTML",
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
        text: `No results found for <b>"${query}"</b>.`,
        parse_mode: "HTML",
      });
      return;
    }

    const resultsMsg = data.results
      .map(
        (item) =>
          `<b>ID:</b> ${item.id}\n` +
          `<b>Customer:</b> ${item.customerName}\n` +
          `<b>Status:</b> ${item.status}\n` +
          `<b>Details:</b> ${item.description || "N/A"}`
      )
      .join("\n\n");

    const responseText = `<b>Search Results for "${query}":</b>\n\n${resultsMsg}`;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: responseText,
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error(
      "SEARCH -> error",
      err?.response?.data || err?.message || err
    );
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Failed to perform the search. Please ensure the query is correct and try again later.",
      parse_mode: "HTML",
    });
  }
}
