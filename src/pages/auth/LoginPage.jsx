import { Helmet } from "react-helmet-async";
// Style
import "./LoginPage.css";
// UI
import AuthForm from "../../features/auth/AuthForm";

export default function LoginPage() {
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
