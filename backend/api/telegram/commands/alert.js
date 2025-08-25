export default async function handleAlert({ axios, chatId, TELEGRAM_API }) {
  try {
    // Let user know it's processing
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "🚨 Preparing alert list. Please wait...",
      parse_mode: "HTML",
    });

    // Call backend API
    const resp = await axios.get(
      `${process.env.API_BASE_URL}/api/regional-3/report/alert`
    );

    const rows = resp.data || [];
    if (!Array.isArray(rows) || rows.length === 0) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "✅ Tidak ada order yang perlu diingatkan saat ini.",
        parse_mode: "HTML",
      });
      return;
    }

    const parts = rows.map((g) => {
      const statusSummary = Object.entries(g.statuses)
        .map(([status, count]) => `${status}: ${count}`)
        .join(" ");

      return `🙎 ${g.pic} – ${g.witel}\n${statusSummary} | Total: ${g.total}`;
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
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Failed to fetch alerts. Please try again later.",
      parse_mode: "HTML",
    });
  }
}
