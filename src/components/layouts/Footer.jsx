import { useState, useEffect } from "react";
// Style
import "./Footer.css";

export default function Footer({ isMobileMenuOpen }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className={`footer ${isMobileMenuOpen ? "mobile-open" : ""}`}>
      <p className="small-h">PT Telkom Indonesia, © 2025</p>
      <p>{time.toLocaleTimeString()}</p>
    </footer>
  );
}
