export default async function handleReport({
  axios,
  telegramId,
  chatId,
  TELEGRAM_API,
  commandText,
  args,
}) {
  try {
    if (commandText === "/reportlastweek") {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "<b>Last 7 days report</b> is not implemented yet. Please check the dashboard.",
        parse_mode: "HTML",
      });
      return;
    }

    if (commandText === "/reportlastmonth") {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "<b>Last 30 days report</b> is not implemented yet. Please check the dashboard.",
        parse_mode: "HTML",
      });
      return;
    }

    const [witelCode] = args;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Preparing your report. Please wait...",
      parse_mode: "HTML",
    });

    const resp = await axios.get(
      `${process.env.API_BASE_URL}/api/regional-3/report/by-telegram`,
      {
        params: {
          telegramId: String(telegramId),
          witel: witelCode || undefined,
        },
      }
    );

    const body = resp.data;
    if (!body || body.matchCount === 0) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "No reports were found for your account.",
        parse_mode: "HTML",
      });
      return;
    }

    const s = body.summary;
    const textMsg =
      `<b>Report for ${body.poName || body.fallbackName || "User"}</b>\n\n` +
      `<b>Total Orders:</b> ${s.totalOrders}\n` +
      `<b>Total Revenue:</b> ${s.totalRevenue}\n` +
      `<b>In Process:</b> ${s.byKategori["IN PROCESS"] || 0}\n` +
      `<b>&lt; 3 Months:</b> ${s.byAge["<3bln"].count} orders\n` +
      `<b>&gt; 3 Months:</b> ${s.byAge[">3bln"].count} orders\n\n` +
      `Please visit the dashboard for a detailed view.\n\n` +
      `Use /help to show commands`;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: textMsg,
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error(
      "REPORT -> error",
      err?.response?.data || err?.message || err
    );
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Failed to generate the report. Please try again later.",
      parse_mode: "HTML",
    });
  }
}
