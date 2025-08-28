// import axios from "axios";

// export default async function handleCaptureTables({ chatId, TELEGRAM_API }) {
//   try {
//     const resp = await axios.post(
//       `https://api.github.com/repos/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}/actions/workflows/${process.env.GITHUB_WORKFLOW_FILE}/dispatches`,
//       {
//         ref: process.env.GITHUB_REF, // branch
//         inputs: { chatId: String(chatId) }, // force string
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.GITHUB_PAT}`,
//           Accept: "application/vnd.github+json",
//         },
//       }
//     );

//     await axios.post(`${TELEGRAM_API}/sendMessage`, {
//       chat_id: chatId,
//       text: "📸 Capturing tables. Wait a sec…",
//       parse_mode: "HTML",
//     });

//     return resp.data;
//   } catch (err) {
//     console.error("[captureTables] error", err?.response?.data || err.message);
//     await axios.post(`${TELEGRAM_API}/sendMessage`, {
//       chat_id: chatId,
//       text: "❌ Failed to trigger capture workflow.",
//       parse_mode: "HTML",
//     });
//   }
// }
