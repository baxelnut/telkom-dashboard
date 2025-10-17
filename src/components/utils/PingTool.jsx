import { useEffect, useState } from "react";
// Style
import "./PingTool.css";
// APIs
const API_URL = import.meta.env.VITE_API_URL;
const DEV_API_URL = import.meta.env.VITE_DEV_API;

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
        const res = await fetch(`${API_URL}/ping?host=${ipData.ip}`);
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
              {/* <p>
                <b>Ping Target:</b> 8.8.8.8 (Google DNS)
              </p> */}
              <p>
                <b>Alive:</b> {result.alive ? "Yes" : "No"}
              </p>
              <p>
                <b>Packets Transmitted: </b>
                {result.transmitted ?? 0}
              </p>
              <p>
                <b>Received:</b> {result.received ?? 0}
              </p>
              <p>
                <b>Packet Loss:</b>{" "}
                {result.packetLoss
                  ? `${parseFloat(result.packetLoss).toFixed(2)}%`
                  : "unknown"}
              </p>
              <p>
                <b>Time:</b> {result.time} ms
              </p>
              {/* <pre>{result.output}</pre> */}
            </div>
          )}
        </>
      )}
    </div>
  );
}
