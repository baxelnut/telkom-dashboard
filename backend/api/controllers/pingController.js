import os from "os";
import ping from "ping";
import https from "https";
import util from "util";
import { exec } from "child_process";

const execPromise = util.promisify(exec);

/** Simple HTTP check fallback */
function httpCheck(
  url = "https://www.google.com/generate_204",
  timeout = 3000,
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
 * Parse traceroute output into hops array for both Linux traceroute and Windows tracert.
 * Returns: [{ hop: 1, probes: [{ host|null, ip, time }], raw }, ...]
 */
function parseTracerouteOutput(stdout, isWindows = false) {
  if (!stdout) return [];

  const lines = stdout.split("\n").map((l) => l.replace(/\r/g, "").trim());
  const hops = [];

  for (const line of lines) {
    if (!line) continue;

    // Match leading hop number
    const hopMatch = line.match(/^\s*([0-9]+)\s+(.*)$/);
    if (!hopMatch) continue;
    const hopNum = Number(hopMatch[1]);
    const rest = hopMatch[2];

    const probes = [];

    if (isWindows) {
      // Windows tracert lines usually like:
      //  1    <1 ms    <1 ms    <1 ms  192.168.1.1
      //  2     *        *        *     Request timed out.
      // or: 2    10 ms     12 ms    11 ms  example.com [93.184.216.34]
      // Capture times and IPs
      const timeRegex = /<\s*1\s*ms|[0-9]+\.?[0-9]*\s*ms/g;
      const ipRegex = /((?:\d{1,3}\.){3}\d{1,3})/g;
      const timeMatches = [...rest.matchAll(timeRegex)].map((m) =>
        m[0].replace(/\s+/g, ""),
      );
      const ipMatches = [...rest.matchAll(ipRegex)].map((m) => m[1]);

      // If times exist but no IPs (e.g. header), try to pick last token as ip-like
      const maxLen = Math.max(timeMatches.length, ipMatches.length, 1);
      for (let i = 0; i < maxLen; i++) {
        probes.push({
          host: null,
          ip: ipMatches[i] || "*",
          time: timeMatches[i]
            ? timeMatches[i].replace("<", "<").replace("1ms", "1 ms")
            : "*",
        });
      }
    } else {
      // Linux traceroute lines can have several probes, with optional host (ip) and times:
      // 2  core21.fsn1.hetzner.com (213.239.254.169)  0.214 ms  core24.fsn1.hetzner.com (213.239.245.241)  0.190 ms 0.172 ms
      // We'll extract groups of (host?) (ip?) time ms
      const groupRegex =
        /([^\s()]+)?\s*(?:\(?((?:\d{1,3}\.){3}\d{1,3})\)?)?\s*([0-9]+\.?[0-9]*)\s*ms/g;
      let m;
      const extracted = [];
      while ((m = groupRegex.exec(rest)) !== null) {
        const hostToken = m[1] || null;
        const ipToken = m[2] || null;
        const timeToken = m[3] || null;
        let ip = ipToken;
        if (!ip && hostToken && /^\d+\.\d+\.\d+\.\d+$/.test(hostToken))
          ip = hostToken;
        extracted.push({
          host: hostToken || null,
          ip: ip || "*",
          time: timeToken ? `${timeToken} ms` : "*",
        });
      }

      if (extracted.length > 0) {
        for (const e of extracted) probes.push(e);
      } else {
        // fallback: look for IPs and times separately
        const ipList = [...rest.matchAll(/((?:\d{1,3}\.){3}\d{1,3})/g)].map(
          (r) => r[1],
        );
        const timeList = [...rest.matchAll(/([0-9]+\.?[0-9]*)\s*ms/g)].map(
          (r) => r[1],
        );
        const maxLen = Math.max(ipList.length, timeList.length, 1);
        for (let i = 0; i < maxLen; i++) {
          probes.push({
            host: null,
            ip: ipList[i] || "*",
            time: timeList[i] ? `${timeList[i]} ms` : "*",
          });
        }
      }
    }

    hops.push({ hop: hopNum, probes, raw: line });
  }

  return hops;
}

/**
 * Run traceroute robustly:
 * - tries platform-specific commands
 * - if command fails, tries to parse err.stdout / err.stderr
 * - returns [] on total failure
 */
async function runTraceroute(
  host,
  { maxHops = 30, probesPerHop = 3, timeoutMs = 8000 } = {},
) {
  const isWindows = os.platform() === "win32";

  // build candidate commands in priority order
  const cmds = isWindows
    ? [
        // use -d (no DNS), -h maxHops; tracert options vary by Windows versions -> try variants
        `tracert -d -h ${maxHops} ${host}`,
        `tracert -d ${host}`,
        `tracert ${host}`,
      ]
    : [
        // linux
        `traceroute -m ${maxHops} -q ${probesPerHop} -w 3 ${host}`,
        `traceroute -m ${maxHops} ${host}`,
      ];

  for (const cmd of cmds) {
    try {
      const { stdout } = await execPromise(cmd, {
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024,
      });
      const hops = parseTracerouteOutput(stdout, isWindows);
      if (hops.length > 0) return hops;
      // if no hops parsed, continue to next command
    } catch (err) {
      // execPromise rejects on non-zero exit; try parsing any output it returned
      const stdout = err.stdout || err.stdout === "" ? err.stdout : null;
      const stderr = err.stderr || null;
      if (stdout && typeof stdout === "string" && stdout.trim()) {
        const hops = parseTracerouteOutput(stdout, isWindows);
        if (hops.length > 0) return hops;
      }
      // if stderr has useful info, attempt parse too (some Windows messages appear in stderr)
      if (stderr && typeof stderr === "string" && stderr.trim()) {
        const hops = parseTracerouteOutput(stderr, isWindows);
        if (hops.length > 0) return hops;
      }
      // otherwise move to next command
      // log small helpful message
      console.warn(
        `runTraceroute: command failed (${cmd}). err.message=${
          err?.message?.split("\n")[0]
        }`,
      );
    }
  }

  // nothing worked
  return [];
}

/**
 * pingHost controller: does ICMP or HTTP fallback, + traceroute
 */
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

      // run traceroute (won't block forever)
      const tracerouteData = await runTraceroute(host, {
        maxHops: 30,
        probesPerHop: 3,
        timeoutMs: 8000,
      });

      return res.json({
        host: icmp.host,
        alive: !!icmp.alive,
        transmitted: 5,
        received: icmp.alive ? 5 : 0,
        packetLoss: Number(packetLoss),
        time:
          icmp.time && icmp.time !== "unknown"
            ? parseFloat(icmp.time)
            : icmp.alive
              ? 0
              : "timeout",
        traceroute: tracerouteData,
        mode: "ICMP",
        output: icmp.output || "",
      });
    } catch (icmpErr) {
      console.log(
        "ICMP blocked or failed, falling back:",
        icmpErr?.message || icmpErr,
      );
    }

    // 2) HTTP fallback simulated 5 pings
    const attempts = 5;
    const timesArr = [];

    for (let i = 0; i < attempts; i++) {
      const r = await httpCheck();
      if (r.ok && typeof r.time === "number") timesArr.push(r.time);
      else timesArr.push(null);
    }

    const validTimes = timesArr.filter((t) => t !== null);
    const received = validTimes.length;
    const packetLoss = Number(((attempts - received) / attempts) * 100);
    const avgTime =
      validTimes.length > 0
        ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
        : "timeout";

    const tracerouteData = await runTraceroute(host, {
      maxHops: 30,
      probesPerHop: 3,
      timeoutMs: 8000,
    });

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
