import React, { useState, useEffect } from "react";
import "./Footer.css";

export default function Footer() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="footer-container">
      <p>PT Telkom Indonesia, © 2025</p>
      <p>{time.toLocaleTimeString()}</p>
    </div>
  );
}
