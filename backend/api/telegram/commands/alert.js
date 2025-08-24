export default async function handleAlert({
  axios,
  chatId,
  TELEGRAM_API,
  args,
}) {
  const [alertAction, ...rest] = args;

  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: "Alert management functionality will be available soon.",
  });
}
