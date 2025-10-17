import os from "os";
import ping from "ping";
import https from "https";
import util from "util";
import { exec } from "child_process";

const execPromise = util.promisify(exec);

/**
 * Simple HTTP check to a fast URL (returns { ok, time }).
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
    req.on("error", () => resolve({ ok: false, time: null }));
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve({ ok: false, time: null });
    });
  });
}

/**
 * Run traceroute using native binary.
 */
async function runTraceroute(host, maxHops = 30) {
  try {
    const { stdout } = await execPromise(
      `traceroute -m ${maxHops} -q 1 ${host}`,
      {
        timeout: 8000,
      }
    );

    const lines = stdout
      .split("\n")
      .filter((l) => l.trim() && /^\s*\d+/.test(l));

    return lines.map((line) => {
      const hopNum = line.match(/^\s*(\d+)/)?.[1];
      const ipMatch = line.match(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/);
      const timeMatch = line.match(/([0-9.]+)\s*ms/);
      return {
        hop: Number(hopNum) || null,
        ip: ipMatch ? ipMatch[1] : "*",
        time: timeMatch ? `${timeMatch[1]} ms` : "*",
      };
    });
  } catch {
    return [];
  }
}

export async function pingHost(req, res) {
  let { host } = req.query;
  if (!host) return res.status(400).json({ error: "Missing host" });

  const isWindows = os.platform() === "win32";
  const extraArgs = isWindows ? ["-n", "5"] : ["-c", "5"];

  try {
    // --- Try ICMP first ---
    try {
      const icmp = await ping.promise.probe(host, {
        timeout: 5,
        min_reply: 1,
        extra: extraArgs,
      });

      const rawPL = parseFloat(icmp.packetLoss);
      const packetLoss = Number.isFinite(rawPL) ? rawPL : icmp.alive ? 0 : 100;
      const tracerouteData = await runTraceroute(host);

      return res.json({
        host: icmp.host,
        alive: !!icmp.alive,
        transmitted: 5,
        received: icmp.alive ? 5 : 0,
        packetLoss,
        time:
          icmp.time && icmp.time !== "unknown"
            ? parseFloat(icmp.time)
            : icmp.alive
            ? 0
            : "timeout",
        traceroute: tracerouteData,
        mode: "ICMP",
      });
    } catch (icmpErr) {
      console.log(
        "ICMP blocked, falling back to HTTP:",
        icmpErr?.message || icmpErr
      );
    }

    // --- HTTP fallback (simulate 5 packets) ---
    const attempts = 5;
    let times = [];
    for (let i = 0; i < attempts; i++) {
      const r = await httpCheck();
      if (r.ok && r.time) times.push(r.time);
      else times.push(null);
    }

    const validTimes = times.filter((t) => t !== null);
    const received = validTimes.length;
    const packetLoss = ((attempts - received) / attempts) * 100;
    const avgTime =
      validTimes.length > 0
        ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
        : "timeout";

    const tracerouteData = await runTraceroute(host);

    return res.json({
      host,
      alive: received > 0,
      transmitted: attempts,
      received,
      packetLoss,
      time: avgTime,
      traceroute: tracerouteData,
      mode: "HTTP-fallback",
    });
  } catch (err) {
    return res.status(500).json({ error: "Ping failed", details: err.message });
  }
}
