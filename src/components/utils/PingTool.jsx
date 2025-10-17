import { useEffect, useState } from "react";
// Style
import "./PingTool.css";
// APIs
const API_URL = import.meta.env.VITE_API_URL;
const DEV_API_URL = import.meta.env.VITE_DEV_API;
const KOYEB_API_URL = import.meta.env.VITE_KOYEB_API;

export default function PingTool() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIpAndPing = async () => {
      try {
        setLoading(true);
        // Get public IP
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        setIp(ipData.ip);

        // Ping that IP
        const res = await fetch(`${KOYEB_API_URL}/ping?host=8.8.8.8`);
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error("Ping failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIpAndPing();
  }, []);

  return (
    <div className="ping-card">
      {loading ? (
        <p>Detecting your IP and running ping...</p>
      ) : (
        <>
          <p>
            <b>Your IP:</b> {ip}
          </p>

          {result && (
            <div className="result">
              <p>
                <b>Alive:</b> {result.alive ? "Yes" : "No"}
              </p>
              <p>
                <b>Packets Transmitted:</b> {result.transmitted ?? 0}
              </p>
              <p>
                <b>Received:</b> {result.received ?? 0}
              </p>
              <p>
                <b>Packet Loss:</b>{" "}
                {Number.isFinite(result.packetLoss)
                  ? `${result.packetLoss.toFixed(2)}%`
                  : "unknown"}
              </p>
              <p>
                <b>Time:</b> {result.time} ms
              </p>

              {/* Traceroute section */}
              <div className="traceroute-section">
                <b>Traceroute:</b>
                {Array.isArray(result.traceroute) &&
                result.traceroute.length > 0 ? (
                  <div className="traceroute-items">
                    {result.traceroute.map((hop) => (
                      <div key={hop.hop} className="hop-items">
                        <b>{hop.hop}.</b>
                        {hop.probes.map((p, i) => (
                          <div key={i}>
                            {p.ip === "*" ? (
                              <span>*</span>
                            ) : (
                              <span>
                                {p.ip}
                                {p.host ? ` (${p.host})` : ""} - {p.time}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No traceroute data</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
