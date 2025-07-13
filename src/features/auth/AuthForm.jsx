import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../../services/firebase/firebase";
import { useAuth } from "../../context/AuthContext";
// UI
import Button from "../../components/ui/buttons/Button";
import Checkbox from "../../components/ui/input/Checkbox";
import InputField from "../../components/ui/input/InputField";
import Loading from "../../components/ui/states/Loading";
import Error from "../../components/ui/states/Error";
import Greetings from "./Greetings";
// Styles
import "./AuthForm.css";

export default function AuthForm() {
  const navigate = useNavigate();
  const { user, setUser, setRole, isApprovedUser } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setRememberMe(localStorage.getItem("rememberMe") === "true");
  }, []);

  useEffect(() => {
    if (user) navigate("/overview", { replace: true });
  }, [user]);

  const handleEmailAuth = async () => {
    if (!email || !password)
      return setErrorMsg("Email and password cannot be empty.");

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      let cred;
      if (isSignup) {
        cred = await createUserWithEmailAndPassword(auth, email, password);
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, firstName, lastName }),
          }
        );
        if (!res.ok) throw new Error("Registration failed.");
        setSuccessMsg("Please wait for admin approval.");
        localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
        return;
      } else {
        cred = await signInWithEmailAndPassword(auth, email, password);
      }

      const adminsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/all-admins`
      );
      if (!adminsRes.ok) throw new Error("Failed to fetch admin data.");
      const { data: admins } = await adminsRes.json();
      const isAdmin = admins.some(
        (a) => a.email === cred.user.email && a.role === "admin"
      );
      setRole(isAdmin ? "admin" : "user");

      if (!isApprovedUser && !isAdmin) {
        throw new Error("Access denied. Your account is pending approval.");
      }

      const token = await cred.user.getIdToken();
      const verifyRes = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: cred.user.email }),
        }
      );
      if (!verifyRes.ok) throw new Error("Access denied. User not authorized.");

      setUser(cred.user);
      navigate("/overview", { replace: true });
    } catch (err) {
      const code = err.code || "";
      if (code.includes("email-already-in-use"))
        setErrorMsg("Email already registered.");
      else if (code.includes("invalid-email"))
        setErrorMsg("Invalid email format.");
      else if (code.includes("user-not-found"))
        setErrorMsg("No account found with that email.");
      else if (code.includes("wrong-password"))
        setErrorMsg("Incorrect email or password.");
      else setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) return setErrorMsg("Please enter your email first.");
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Reset email sent! Check your inbox.");
    } catch (err) {
      setErrorMsg(
        err.code?.includes("invalid-email")
          ? "Invalid email."
          : "Failed to send reset email."
      );
    }
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
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
          />
          <InputField
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
          />
        </>
      )}

      <InputField
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />
      <div className="password-field">
        <InputField
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          obscurial
          fullWidth
        />
      </div>

      <div className="helper-container">
        <Checkbox
          label="Remember me"
          checked={rememberMe}
          onChange={(value) => setRememberMe(value)}
        />
        {!isSignup && (
          <a className="link" onClick={handleForgot}>
            Forgot password?
          </a>
        )}
      </div>

      {errorMsg && <Error message={errorMsg} />}
      {successMsg && <div className="success-msg">{successMsg}</div>}

      <Button
        text={isSignup ? "Sign Up" : "Login"}
        onClick={handleEmailAuth}
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
            setIsSignup((s) => !s);
            setErrorMsg("");
            setSuccessMsg("");
          }}
        >
          {isSignup ? "Login" : "Sign Up"}
        </a>
      </div>
    </div>
  );
}
