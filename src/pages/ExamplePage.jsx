import { useState } from "react";
import Button from "../components/ui/buttons/Button";

export default function ExamplePage({ API_URL }) {
  const [status, setStatus] = useState("");

  const sendTelegramMessage = async (target = "private") => {
    setStatus(`Sending to ${target}...`);

    try {
      const res = await fetch(`${API_URL}/telegram/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `📢 *Test Message* to ${target.toUpperCase()} Chat\n\nThis was sent at: ${new Date().toLocaleString()}`,
          target,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setStatus(`✅ Sent to ${target} successfully!`);
        console.log("Telegram sent:", json);
      } else {
        setStatus(`❌ Failed to send to ${target}`);
        console.error("Telegram error:", json);
      }
    } catch (err) {
      console.error(err);
      setStatus(`❌ Error while sending to ${target}`);
    }
  };

  return (
    <div className="example-page">
      {/* <h5>Telegram Test</h5>
      <Button
        text="Send to Private"
        onClick={() => sendTelegramMessage("private")}
        fullWidth
      />
      <Button
        text="Send to Group"
        onClick={() => sendTelegramMessage("group")}
        fullWidth
        style={{ marginTop: "1rem" }}
      /> */}

      <p>for testing only</p>
    </div>
  );
}
