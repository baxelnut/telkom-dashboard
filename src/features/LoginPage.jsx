import { useEffect, useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/firebase/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const auth = getAuth();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [greeting, setGreeting] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // useEffect(() => {
  //   if (user) navigate("/overview");
  // }, [user]);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning!");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good afternoon!");
      } else {
        setGreeting("Good evening!");
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/overview");
    } catch (err) {
      setErrorMsg("Google sign-in failed. Try again.");
      console.error("Google login error:", err.message);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Email and password cannot be empty.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/overview");
    } catch (err) {
      console.error("Email login error:", err.message);
      switch (err.code) {
        case "auth/invalid-email":
          setErrorMsg("Invalid email format.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          setErrorMsg("Wrong email or password.");
          break;
        default:
          setErrorMsg("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <img className="logo" src="/TLK_BIG.svg" alt="logo" />
      <div className="login-card">
        <div className="login-header">
          <h3>{greeting}</h3>
          <p>Please login or sign up to continue</p>
        </div>

        <div className="email-field">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg
                className="show-password"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
              </svg>
            ) : (
              <svg
                className="show-password"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
              </svg>
            )}
          </div>
        </div>

        <div className="helper-container">
          <div className="remember-me">
            <input className="checkbox" type="checkbox" />
            <p>Remember me</p>
          </div>
          <a href="">Forgot Password?</a>
        </div>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        <button onClick={handleEmailLogin}>
          <p>Sign in</p>
        </button>

        <div className="divider">
          <div className="line"></div>
          <p>or</p>
          <div className="line"></div>
        </div>

        <button className="sign-in-google" onClick={handleGoogleLogin}>
          <img
            className="g-logo"
            src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
            alt="google"
          />
          <p>Login with Google</p>
        </button>

        <div className="sign-up">
          <p>Don't have an account?</p>
          <a href="">Sign up</a>
        </div>
      </div>
    </div>
  );
}
