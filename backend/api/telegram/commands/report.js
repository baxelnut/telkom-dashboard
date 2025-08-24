export default async function handleReport({
  axios,
  telegramId,
  chatId,
  TELEGRAM_API,
  args,
}) {
  const [reportType, ...rest] = args;

  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: "Preparing your report. Please wait...",
  });

  try {
    const resp = await axios.get(
      `${process.env.API_BASE_URL}/api/regional-3/report/by-telegram`,
      {
        params: { telegramId: String(telegramId) },
      }
    );

    const body = resp.data;
    if (!body || body.matchCount === 0) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "No reports were found for your account.",
      });
      return;
    }

    const s = body.summary;
    const textMsg =
      `**Report for ${body.poName || body.fallbackName || "User"}**\n\n` +
      `**Total Orders:** ${s.totalOrders}\n` +
      `**Total Revenue:** ${s.totalRevenue}\n` +
      `**In Process:** ${s.byKategori["IN PROCESS"] || 0}\n` +
      `**< 3 Months:** ${s.byAge["<3bln"].count} orders\n` +
      `**> 3 Months:** ${s.byAge[">3bln"].count} orders\n\n` +
      `Please visit the dashboard for a detailed view.`;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: textMsg,
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.error(
      "REPORT -> error",
      err?.response?.data || err?.message || err
    );
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Failed to generate the report. Please try again later.",
    });
  }
}
