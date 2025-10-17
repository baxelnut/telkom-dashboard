import os from "os";
import ping from "ping";

export async function pingHost(req, res) {
  let { host } = req.query;

  // If no host provided or host == user's IP, fallback to Google DNS
  if (!host || host.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
    host = "8.8.8.8"; // Google DNS
  }

  try {
    const isWindows = os.platform() === "win32";
    const extraArgs = isWindows ? ["-n", "4"] : ["-c", "4"];

    const result = await ping.promise.probe(host, {
      timeout: 10,
      min_reply: 1,
      extra: extraArgs,
    });

    res.json({
      host: result.host,
      alive: result.alive,
      time: result.time || "unknown",
      packetLoss: result.packetLoss || "unknown",
      output: result.output,
    });
  } catch (err) {
    res.status(500).json({ error: "Ping failed", details: err.message });
  }
}
