// Style
import "./LoginPage.css";
// UI
import AuthForm from "../../features/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="login-page">
      <img className="logo" src="/logos/telkom-big.svg" alt="Logo" />
      <div className="card login">
        <AuthForm />
      </div>
    </div>
  );
}
