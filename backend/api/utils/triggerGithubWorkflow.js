import axios from "axios";

/**
 * Trigger a GitHub Actions workflow_dispatch in repo.
 */
export default async function triggerGithubWorkflow({
  owner,
  repo,
  workflowFile, // e.g. "capture-on-demand.yml"
  ref = "main",
  token, // PAT with repo:actions/workflow permissions
  inputs = {}, // { chatId: "123", tables: "aosodomoro,galaksi" }
}) {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;

  if (!token) throw new Error("Missing GitHub PAT token");

  await axios.post(
    url,
    { ref, inputs },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
}
