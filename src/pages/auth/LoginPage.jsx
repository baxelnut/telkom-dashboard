import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
// Style
import "./LoginPage.css";
// UI
import AuthForm from "../../features/auth/AuthForm";

export default function LoginPage() {
  useEffect(() => {
    // Save previous mode
    const previousTheme = document.body.classList.contains("dark")
      ? "dark"
      : "light";

    // Force light mode
    document.body.classList.remove("dark");
    document.body.classList.add("light");

    // Optionally: update localStorage too so ThemeProvider doesn't revert it
    localStorage.setItem("theme", "light");

    return () => {
      // Restore previous theme
      document.body.classList.remove("light", "dark");
      document.body.classList.add(previousTheme);
      localStorage.setItem("theme", previousTheme);
    };
  }, []);

  return (
    <div className="login-page">
      <Helmet>
        <title>Login | Telkom Dashboard</title>
        <meta
          name="description"
          content="Secure login portal for authorized Telkom Indonesia personnel."
        />
      </Helmet>

      <img className="logo" src="/logos/telkom-big.svg" alt="Logo" />
      <div className="card login">
        <AuthForm />
      </div>
    </div>
  );
}
