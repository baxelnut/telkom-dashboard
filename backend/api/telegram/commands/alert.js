export default async function handleAlert({ axios, chatId, TELEGRAM_API }) {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "🚨 Preparing alert list. Please wait...",
      parse_mode: "HTML",
    });

    const resp = await axios.get(
      `${process.env.API_BASE_URL}/api/regional-3/report/alert`
    );

    const rows = resp?.data || [];
    if (!Array.isArray(rows) || rows.length === 0) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "✅ Tidak ada order yang perlu diingatkan saat ini.",
        parse_mode: "HTML",
      });
      return;
    }

    const parts = rows.map((g) => {
      const statuses = g.statuses || {};
      // dynamic, don't sort by hardcoded values
      const statusSummary = Object.entries(statuses)
        .map(([status, count]) => `${status}: ${count}`)
        .join(" | ");

      const pic = g.pic || "UNKNOWN";
      const witel = g.witel || "-";
      const total =
        typeof g.total === "number"
          ? g.total
          : Object.values(statuses).reduce((s, v) => s + Number(v || 0), 0);

      return `🙎 ${pic} – ${witel}\n${statusSummary} | Total: ${total}`;
    });

    const now = new Date().toISOString().slice(0, 10);

    const textMsg =
      `📢 <b>Pemberitahuan Potensi Order &gt; 3 Bulan</b>\n\n` +
      `Berikut daftar order yang hampir melewati 3 bulan:\n\n` +
      parts.join("\n\n") +
      `\n\n⚠️ <i>Mohon segera dilakukan follow-up sebelum melewati batas waktu</i> ⚠️\n\n` +
      `Waktu Update: ${now}\n\n` +
      `🔗 https://rso2telkomdashboard.web.app/action-based`;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: textMsg,
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error("ALERT -> error", err?.response?.data || err?.message || err);
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "Failed to fetch alerts. Please try again.",
        parse_mode: "HTML",
      });
    } catch (sendErr) {
      console.error(
        "ALERT -> fallback send error",
        sendErr?.message || sendErr
      );
    }
  }
}
