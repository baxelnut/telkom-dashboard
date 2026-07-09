export default async function handleReport({
  axios,
  telegramId,
  chatId,
  TELEGRAM_API,
  args,
}) {
  try {
    let picQuery = args.join(" ").trim();
    let endpoint = "/report/by-telegram";
    const params = { telegramId: String(telegramId) };

    if (picQuery) {
      endpoint = "/report/pic";
      params.pic = picQuery.toUpperCase(); // normalize for partial matching in controller
    }

    // Let user know it's processing
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "📊 Preparing your report. Please wait...",
      parse_mode: "HTML",
    });

    const resp = await axios.get(
      `${process.env.API_BASE_URL}/api/regional-3${endpoint}`,
      {
        params,
      },
    );

    const body = resp.data;
    const items = body.items || [];

    // collect unique PIC names
    const uniquePics = [...new Set(items.map((r) => r.PIC))];
    if (uniquePics.length > 1) {
      const list = uniquePics.map((n) => `- ${n}`).join("\n");
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `⚠️ Ditemukan ${uniquePics.length} PIC yang cocok dengan "<b>${picQuery}</b>":\n\n${list}\n\n👉 Mohon ketik nama yang lebih spesifik.`,
        parse_mode: "HTML",
      });
      return;
    }

    if (!body || body.matchCount === 0 || items.length === 0) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: picQuery
          ? `❌ No report found for <b>${picQuery}</b>. Make sure you typed the full name correctly.`
          : `✅ You don't have any unmarked <b>In Process</b> orders with <b>Umur Order > 60</b>.`,
        parse_mode: "HTML",
      });
      return;
    }

    const firstItem = items[0] || {};
    const displayName =
      items.length > 0
        ? items[0]["PO_NAME"] || items[0]["PIC"] || body.poName || "Unknown"
        : body.poName || "Unknown";
    const witel = firstItem["NEW_WITEL"] ?? firstItem["New Witel"] ?? "-";

    // Filtered items
    const filtered = items.filter((r) => {
      const umur = Number(r["UMUR_ORDER"] ?? 0);
      const kategori = String(r["KATEGORI"] ?? "")
        .trim()
        .toUpperCase();

      return (
        !isNaN(umur) && umur > 60 && umur <= 90 && kategori === "IN PROCESS"
      );
    });

    const top10 = filtered
      .sort(
        (a, b) => Number(b["UMUR_ORDER"] ?? 0) - Number(a["UMUR_ORDER"] ?? 0),
      )
      .slice(0, 10);

    const formattedRows = top10
      .map((r) => {
        const orderId = String(r["ORDERID"] ?? r["ORDER_ID"] ?? "").trim();
        const subtype = String(
          r["ORDERSUBTYPE"] ?? r["ORDER_SUBTYPE"] ?? "",
        ).trim();
        return `${orderId || "-"}  | ${subtype || "-"}`;
      })
      .join("\n");

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    let extraNote = "";
    if (filtered.length > 10) {
      extraNote =
        "\n<i>Data yang ditampilkan Top 10 Umur Order, selebihnya dapat dicek melalui link:</i>\n" +
        "🔗 https://rso2telkomdashboard.web.app\n\n";
    }
    const textMsg =
      `📢 <b>Alert Order Mendekati > 2 BLN</b>\n\n` +
      `<i>Witel: ${witel}</i>\n` +
      `<i>PO: ${displayName}</i>\n\n` +
      `⚠️ <b>ORDER > 60 hari (A1 : Prioritas)</b>\n` +
      `<pre>ORDERID     | ORDERSUBTYPE\n--------------------------------\n${formattedRows}</pre>\n\n` +
      `Waktu Update: ${dateStr}\n\n` +
      extraNote +
      `🔗 https://rso2telkomdashboard.web.app/action-based`;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: textMsg,
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error(
      "REPORT -> error",
      err?.response?.data || err?.message || err,
    );
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Failed to generate the report. Please try again.",
      parse_mode: "HTML",
    });
  }
}
