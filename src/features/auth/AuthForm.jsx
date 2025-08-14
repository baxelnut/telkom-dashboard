import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Styles
import "./AuthForm.css";
// Components
import Button from "../../components/ui/buttons/Button";
import Checkbox from "../../components/ui/input/Checkbox";
import Error from "../../components/ui/states/Error";
import Greetings from "./Greetings";
import InputField from "../../components/ui/input/InputField";
import Loading from "../../components/ui/states/Loading";
// Context + service
import { useAuth } from "../../context/AuthContext";
// Custom hook
import { useEmailAuth } from "../../hooks/useEmailAuth";

export default function AuthForm() {
  const { user, setUser, setRole, isApprovedUser } = useAuth();
  const { loading, message, loginOrSignup, forgotPassword } = useEmailAuth({
    setUser,
    setRole,
    isApprovedUser,
  });
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    telegramId: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setRememberMe(localStorage.getItem("rememberMe") === "true");
  }, []);

  useEffect(() => {
    if (user) navigate("/overview", { replace: true });
  }, [user]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  if (loading)
    return (
      <div className="auth-form">
        <Loading backgroundColor="transparent" />
      </div>
    );

  return (
    <div className="auth-form">
      <div className="title">
        <Greetings />
        <p>{isSignup ? "Create your account" : "Please login to continue"}</p>
      </div>

      {isSignup && (
        <>
          <InputField
            label="First Name"
            placeholder="Enter first name"
            value={form.firstName}
            onChange={handleChange("firstName")}
            fullWidth
            required
          />
          <InputField
            label="Last Name"
            placeholder="Enter last name"
            value={form.lastName}
            onChange={handleChange("lastName")}
            fullWidth
            required
          />
          <InputField
            label="Telegram ID"
            placeholder="Enter Telegram ID"
            value={form.telegramId}
            onChange={handleChange("telegramId")}
            fullWidth
            isId
            required
          />
        </>
      )}

      <InputField
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={form.email}
        onChange={handleChange("email")}
        fullWidth
        required
      />
      <InputField
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={form.password}
        onChange={handleChange("password")}
        obscurial
        fullWidth
        required
      />

      <div className="helper-container">
        <Checkbox
          label="Remember me"
          checked={rememberMe}
          onChange={setRememberMe}
        />
        {!isSignup && (
          <a className="link" onClick={() => forgotPassword(form.email)}>
            Forgot password?
          </a>
        )}
      </div>

      {message.type === "error" && <Error message={message.text} />}
      {message.type === "success" && (
        <div className="success-container">
          <p className="success-msg">{message.text}</p>
        </div>
      )}

      <Button
        text={isSignup ? "Sign Up" : "Login"}
        onClick={() => {
          loginOrSignup({ ...form, rememberMe, isSignup }).then(
            (ok) => ok && navigate("/overview", { replace: true })
          );
        }}
        fullWidth
        disabled={loading}
      />

      <div className="toggle-auth-container">
        <p>
          {isSignup ? "Already have an account?" : "Don't have an account?"}
        </p>
        <a
          className="link"
          onClick={() => {
            setIsSignup(!isSignup);
            setForm({ ...form, password: "" });
          }}
        >
          {isSignup ? "Login" : "Sign Up"}
        </a>
      </div>
    </div>
  );
}
