import os from "os";
import ping from "ping";
import https from "https";

/**
 * Simple HTTP check to a fast URL (returns { ok, time }).
 * Uses https.get and resolves quickly or false on error/timeout.
 */
function httpCheck(
  url = "https://www.google.com/generate_204",
  timeout = 3000
) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = https.get(url, (res) => {
      // consume and ignore body
      res.resume();
      const duration = Date.now() - start;
      resolve({ ok: true, time: duration });
    });

    req.on("error", () => resolve({ ok: false }));
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve({ ok: false });
    });
  });
}

export async function pingHost(req, res) {
  let { host } = req.query;
  if (!host) return res.status(400).json({ error: "Missing host" });

  const isWindows = os.platform() === "win32";
  const extraArgs = isWindows ? ["-n", "4"] : ["-c", "4"];

  try {
    // 1) Try ICMP ping first (works locally / on servers that allow it)
    try {
      const icmp = await ping.promise.probe(host, {
        timeout: 5,
        min_reply: 1,
        extra: extraArgs,
      });

      // Normalize packetLoss to a NUMBER and ensure it's valid
      const rawPL = parseFloat(icmp.packetLoss);
      const packetLoss = Number.isFinite(rawPL) ? rawPL : icmp.alive ? 0 : 100;

      return res.json({
        host: icmp.host,
        alive: !!icmp.alive,
        time:
          icmp.time && icmp.time !== "unknown"
            ? icmp.time
            : icmp.alive
            ? 0
            : "timeout",
        transmitted: 4,
        received: icmp.alive ? 4 : 0,
        packetLoss, // number
        mode: "ICMP",
        output: icmp.output || "",
      });
    } catch (icmpErr) { 
      // console.debug("ICMP failed, falling back:", icmpErr.message);
    }

    // 2) HTTP fallback measure latency to a reliable endpoint
    const httpResult = await httpCheck();
    if (httpResult.ok) {
      return res.json({
        host,
        alive: true,
        time: httpResult.time,
        transmitted: 1,
        received: 1,
        packetLoss: 0,
        mode: "HTTP-fallback",
      });
    } else {
      return res.json({
        host,
        alive: false,
        time: "timeout",
        transmitted: 1,
        received: 0,
        packetLoss: 100,
        mode: "HTTP-fallback",
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "Ping failed", details: err.message });
  }
}
