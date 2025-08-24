export default async function handleHelp({
  axios,
  chatId,
  TELEGRAM_API,
  commandList,
}) {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: commandList,
    parse_mode: "Markdown",
  });
}
