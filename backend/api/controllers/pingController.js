import os from "os";
import ping from "ping";
import https from "https";
import util from "util";
import { exec } from "child_process";

const execPromise = util.promisify(exec);

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

/**
 * Call HackerTarget MTR endpoint and parse top 5 hops into JSON.
 * Returns array: [{ hop: 1, ip: "x.x.x.x", time: "12 ms" }, ...]
 * If anything goes wrong, returns [].
 */
async function runTraceroute(host, maxHops = 30) {
  try {
    // Run traceroute command (limit hops and timeout)
    const { stdout } = await execPromise(
      `traceroute -m ${maxHops} -q 1 ${host}`,
      {
        timeout: 8000,
      }
    );

    // Split and map lines to hops
    const lines = stdout
      .split("\n")
      .filter((l) => l.trim() && /^\s*\d+/.test(l));

    const hops = lines.map((line) => {
      const hopNum = line.match(/^\s*(\d+)/)?.[1];
      const ipMatch = line.match(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/);
      const timeMatch = line.match(/([0-9.]+)\s*ms/);
      return {
        hop: Number(hopNum) || null,
        ip: ipMatch ? ipMatch[1] : "*",
        time: timeMatch ? `${timeMatch[1]} ms` : "*",
      };
    });

    return hops;
  } catch (err) {
    console.error("Traceroute failed:", err.message);
    return [];
  }
}

export async function pingHost(req, res) {
  let { host } = req.query;
  if (!host) return res.status(400).json({ error: "Missing host" });

  const isWindows = os.platform() === "win32";
  const extraArgs = isWindows ? ["-n", "5"] : ["-c", "5"];

  try {
    // 1) Try ICMP ping first
    try {
      const icmp = await ping.promise.probe(host, {
        timeout: 5,
        min_reply: 1,
        extra: extraArgs,
      });

      const rawPL = parseFloat(icmp.packetLoss);
      const packetLoss = Number.isFinite(rawPL) ? rawPL : icmp.alive ? 0 : 100;

      // Always attempt traceroute via HackerTarget API (fast, works on Vercel)
      // but keep it short (msTimeout) to prevent long waits.
      const tracerouteData = await runTraceroute(host);

      return res.json({
        host: icmp.host,
        alive: !!icmp.alive,
        time:
          icmp.time && icmp.time !== "unknown"
            ? icmp.time
            : icmp.alive
            ? 0
            : "timeout",
        transmitted: 5,
        received: icmp.alive ? 5 : 0,
        packetLoss,
        traceroute: tracerouteData,
        mode: "ICMP",
        output: icmp.output || "",
      });
    } catch (icmpErr) {
      // ICMP failed — fall through to HTTP fallback
      console.log("ICMP failed, falling back:", icmpErr?.message || icmpErr);
    }

    // 2) HTTP fallback (works on Vercel)
    const httpResult = await httpCheck();
    const tracerouteData = await runTraceroute(host);

    if (httpResult.ok) {
      return res.json({
        host,
        alive: true,
        time: httpResult.time,
        transmitted: 1,
        received: 1,
        packetLoss: 0,
        traceroute: tracerouteData,
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
        traceroute: tracerouteData,
        mode: "HTTP-fallback",
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "Ping failed", details: err.message });
  }
}
