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
function runTraceroute(host, msTimeout = 2000) {
  return new Promise((resolve) => {
    try {
      const url = `https://api.hackertarget.com/mtr/?q=${encodeURIComponent(
        host
      )}`;
      const t = setTimeout(() => resolve([]), msTimeout);

      https
        .get(url, (res) => {
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            clearTimeout(t);
            try {
              const text = Buffer.concat(chunks).toString("utf8").trim();
              if (
                !text ||
                text.toLowerCase().includes("error") ||
                text.includes("no output")
              ) {
                return resolve([]);
              }

              // Break into lines and parse hop entries (limit 5).
              const lines = text.split("\n").map((l) => l.trim());
              const hops = [];

              for (const line of lines) {
                // Common MTR/traceroute formats we try to parse:
                // "1. 192.168.1.1  0.5 ms  0.5 ms  0.6 ms"
                // " 1  192.168.1.1  0.5 ms  0.5 ms  0.6 ms"
                // " 1  example.com (93.184.216.34)  1.23 ms"
                // Try main match: hop number + ip/host + rest
                const hopMatch = line.match(
                  /^\s*([0-9]+)[\.\)]?\s+([0-9a-zA-Z\.\-_:()]+)\s+(.*)$/
                );
                if (hopMatch) {
                  const hopNum = Number(hopMatch[1]);
                  const ipOrHost = hopMatch[2];
                  const rest = hopMatch[3] || "";

                  // extract first rtt (ms)
                  const rttMatch = rest.match(/([0-9]+\.?[0-9]*)\s*ms/);
                  const time = rttMatch ? `${rttMatch[1]} ms` : "unknown";

                  // normalize ip: if ipOrHost contains '(' and ')' get ip inside
                  let ip = ipOrHost;
                  const inParens = ipOrHost.match(/\(([\d\.]+)\)/);
                  if (inParens) ip = inParens[1];

                  hops.push({ hop: hopNum, ip, time });
                } else {
                  // fallback: try extract ip inside parentheses later in the string
                  const alt = line.match(
                    /^\s*([0-9]+).*?\((\d+\.\d+\.\d+\.\d+)\).*?([0-9]+\.?[0-9]*)\s*ms/
                  );
                  if (alt) {
                    hops.push({
                      hop: Number(alt[1]),
                      ip: alt[2],
                      time: `${alt[3]} ms`,
                    });
                  }
                }

                if (hops.length >= 5) break;
              }

              resolve(hops);
            } catch (e) {
              resolve([]);
            }
          });
        })
        .on("error", () => {
          clearTimeout(t);
          resolve([]);
        });
    } catch {
      resolve([]);
    }
  });
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
      const tracerouteData = await runTraceroute(host, 1500);

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
    const tracerouteData = await runTraceroute(host, 1500);

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
