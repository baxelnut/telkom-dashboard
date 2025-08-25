export default async function handleReport({
  axios,
  telegramId,
  chatId,
  TELEGRAM_API,
  args,
}) {
  try {
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
    const items = body.items || [];

    // Format items into table
    const formattedRows = items
      .map((r) => {
        const orderId = String(r["ORDERID"] ?? r["ORDER_ID"] ?? "").trim();
        const subtype = String(
          r["ORDERSUBTYPE"] ?? r["ORDER_SUBTYPE"] ?? ""
        ).trim();
        return `${orderId || "-"}  | ${subtype || "-"}`;
      })
      .join("\n");

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

    const textMsg =
      `📢 <b>Alert Order Mendekati &gt; 3 BLN</b>\n\n` +
      `Witel: ${body.witel || witelCode || "-"}\n` +
      `PO: ${body.poName || body.fallbackName || "Unknown"}\n\n` +
      `⚠️ ORDER &gt; 60 hari (A1 : Prioritas)\n` +
      `<pre>ORDERID     | ORDERSUBTYPE\n--------------------------------\n${formattedRows}</pre>\n\n` +
      `Waktu Update: ${dateStr}\n\n` +
      `🔗 https://rso2telkomdashboard.web.app/action-based`;

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
