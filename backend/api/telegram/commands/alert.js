export default async function handleAlert({ axios, chatId, TELEGRAM_API }) {
  try {
    // trim inputs to avoid stray whitespace/newline issues
    TELEGRAM_API = (TELEGRAM_API || "").toString().trim();
    chatId = (chatId || "").toString().trim();

    // call getChat from same env
    try {
      const getChatUrl = `${TELEGRAM_API}/getChat`;
      const getChatResp = await axios.get(getChatUrl, {
        params: { chat_id: chatId },
      });
    } catch (gErr) {
      console.error(
        "⛔ getChat failed:",
        gErr?.response?.data || gErr.message || gErr
      );
    }

    // fetch alert data from your API
    const resp = await axios.get(
      `${process.env.API_BASE_URL}/api/regional-3/report/alert`
    );

    // support multiple shapes
    let rows = resp.data;
    if (!Array.isArray(rows)) {
      if (Array.isArray(resp.data?.data)) rows = resp.data.data;
      else if (Array.isArray(resp.data?.rows)) rows = resp.data.rows;
      else rows = [];
    }

    // build message
    let messageBody, sendUrl;
    if (!Array.isArray(rows) || rows.length === 0) {
      messageBody = {
        chat_id: chatId,
        text: "✅ Tidak ada order yang perlu diingatkan saat ini.",
        parse_mode: "HTML",
      };
    } else {
      const parts = rows.map((g) => {
        const statuses = g.statuses || {};
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
        
      messageBody = {
        chat_id: chatId,
        text: textMsg,
        parse_mode: "HTML",
      };
    }

    // Send message (explicit Content-Type)
    sendUrl = `${TELEGRAM_API}/sendMessage`;
    const postResp = await axios.post(sendUrl, messageBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    return postResp.data;
  } catch (err) {
    console.error("ALERT -> error", err?.response?.data || err?.message || err);
    // fallback: try send simple text message about failure
    try {
      await axios.post(
        `${TELEGRAM_API}/sendMessage`,
        {
          chat_id: String(chatId),
          text: "Failed to fetch alerts. Please try again later.",
          parse_mode: "HTML",
        },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (sendErr) {
      console.error(
        "ALERT -> fallback send error",
        sendErr?.response?.data || sendErr?.message || sendErr
      );
    }
    throw err;
  }
}
