import { useState, useEffect } from "react";

export default function Greetings() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const h = new Date().getHours();
      setGreeting(
        h < 12 ? "Good morning!" : h < 17 ? "Good afternoon!" : "Good evening!"
      );
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60_000);
    return () => clearInterval(interval);
  }, []);

  return <h4>{greeting}</h4>;
}
