import { sendTableToTelegram } from "../../../../src/features/bot/sendTableToTelegram.js";
import { formatDate } from "../../../../src/helpers/formattingUtils.js";

export default async function handleAlert({
  axios,
  chatId,
  TELEGRAM_API,
  API_URL,
}) {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "🚨 Preparing alert list. Please wait...",
      parse_mode: "HTML",
    });

    // Existing text alert logic
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

    // Send Aosodomoro table to the same chat
    await sendTableToTelegram({
      selector: ".aosodomoro-table table",
      API_URL,
      chatId, // force direct message to this user
      target: "private",
      title: "Weekly Report AOSODOMORO Non Connectivity",
      subtext:
        "Source: Database NCX\n\nUntuk detail data dapat diakses melalui link berikut:",
      link: "https://rso2telkomdashboard.web.app/reports/aosodomoro",
      dateStr: formatDate(),
    });

    // Send Galaksi table to the same chat
    await sendTableToTelegram({
      selector: ".galaksi-table table",
      API_URL,
      chatId,
      target: "private",
      title: "GALAKSI PO AOSODOMORO Non Conn",
      subtext: "Zero AOSODOMORO > 3 BLN",
      link: "https://rso2telkomdashboard.web.app/reports/galaksi",
      dateStr: formatDate(),
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
