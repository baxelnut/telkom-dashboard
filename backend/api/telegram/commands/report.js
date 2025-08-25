export default async function handleReport({
  axios,
  telegramId,
  chatId,
  TELEGRAM_API,
  args,
}) {
  try {
    const [witelCode] = args;

    // Let user know it's processing
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Preparing your report. Please wait...",
      parse_mode: "HTML",
    });

    // Call backend API
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
    const items = body.items || [];
    const firstItem = items[0] || {};
    const displayName = body.poName || body.fallbackName || "Unknown";
    const witel =
      firstItem["NEW_WITEL"] ?? firstItem["New Witel"] ?? witelCode ?? "-";

    // Filter logic:
    // UMUR_ORDER > 60
    // KATEGORI === "IN PROCESS"
    // STATUS is empty / null / undefined / "No Status"
    const filtered = items.filter((r) => {
      const umur = Number(r["UMUR_ORDER"] ?? 0);
      const kategori = String(r["KATEGORI"] ?? "")
        .trim()
        .toUpperCase();
      const status = String(r["STATUS"] ?? "")
        .trim()
        .toUpperCase();

      return (
        !isNaN(umur) &&
        umur > 60 &&
        kategori === "IN PROCESS" &&
        (!status || status === "NO STATUS")
      );
    });

    if (!body || body.matchCount === 0 || filtered.length === 0) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `✅ You don't have any unmarked <b>In Process</b> orders with <b>Umur Order &gt; 60</b>.`,
        parse_mode: "HTML",
      });
      return;
    }

    // Format filtered rows
    const formattedRows = filtered
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
      `Witel: ${witel}\n` +
      `PO: ${displayName}\n\n` +
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
