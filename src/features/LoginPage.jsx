import { useState, useEffect } from "react";
import { auth } from "../services/firebase/index";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/firebase/AuthContext";
import "./LoginPage.css";
import Loading from "../components/utils/Loading";
import Error from "../components/utils/Error";

const API_URL = import.meta.env.VITE_API_URL;
const DEV_API_URL = import.meta.env.VITE_DEV_API;

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { isAdmin, role, setRole, user, isApprovedUser } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/overview");
    }
  }, [user]);

  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe") === "true";
    setRememberMe(remembered);
  }, []);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting("Good morning!");
      else if (hour >= 12 && hour < 17) setGreeting("Good afternoon!");
      else setGreeting("Good evening!");
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setErrorMsg("Email and password cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const persistence = rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;

      await setPersistence(auth, persistence);

      let userCredential;

      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const loggedInUser = userCredential.user;

        const registerRes = await fetch(`${API_URL}/admin/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loggedInUser.email,
            firstName,
            lastName,
          }),
        });

        if (!registerRes.ok) {
          throw new Error("Registration failed.");
        } else {
          setSuccessMsg("Please wait for admin approval.");
          setErrorMsg("");
          return;
        }
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      const loggedInUser = userCredential.user;

      const res = await fetch(`${API_URL}/admin/all-admins`);
      if (!res.ok) throw new Error("Failed to fetch admin data.");

      const json = await res.json();
      const admins = json.data;

      const matchedAdmin = admins.find(
        (admin) => admin.email === loggedInUser.email
      );

      if (matchedAdmin && matchedAdmin.role === "admin") {
        setRole("admin");
      } else {
        setRole("admin");
      }

      if (!isApprovedUser || !matchedAdmin) {
        setErrorMsg("Access denied. Your account is pending approval.");
        return;
      }

      const idToken = await loggedInUser.getIdToken();

      const verifyRes = await fetch(`${API_URL}/auth/verify-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email: loggedInUser.email }),
      });

      if (!verifyRes.ok) {
        throw new Error("Access denied. User is not authorized.");
      }

      const { role } = await verifyRes.json();

      setRole("admin");
      setUser(loggedInUser);
      navigate("/overview");
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setErrorMsg("Email already registered. Try logging in.");
          break;
        case "auth/invalid-email":
          setErrorMsg("Invalid email format.");
          break;
        case "auth/user-not-found":
          setErrorMsg("No account found with that email.");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setErrorMsg("Incorrect email or password.");
          break;
        case "auth/weak-password":
          setErrorMsg("Password must be at least 6 characters.");
          break;
        case "auth/too-many-requests":
          setErrorMsg("Too many attempts. Try again later.");
          break;
        default:
          setErrorMsg(err.message || "Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setErrorMsg("Reset email sent! Check your inbox.");
    } catch (err) {
      console.error("Password reset error:", err.message);
      switch (err.code) {
        case "auth/invalid-email":
          setErrorMsg("Invalid email address.");
          break;
        case "auth/user-not-found":
          setErrorMsg("No user found with this email.");
          break;
        default:
          setErrorMsg("Failed to send reset email. Try again later.");
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="login-container">
      <img className="logo" src="/TLK_BIG.svg" />
      <div className="login-card">
        <div className="login-header">
          <h3>{greeting}</h3>
          <p>{isSignup ? "Create your account" : "Please login to continue"}</p>
        </div>
        {isSignup && (
          <div className="email-field">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
        )}
        {isSignup && (
          <div className="email-field">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        )}
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
          <div
            className="remember-me"
            style={{ display: errorMsg ? "none" : "flex" }}
          >
            <input
              className="checkbox"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />

            <p>Remember me</p>
          </div>

          {!isSignup && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleForgotPassword();
              }}
              style={{
                width: errorMsg ? "100%" : "fit-content",
                textAlign: "end",
              }}
            >
              Forgot Password?
            </a>
          )}
        </div>
        {errorMsg && (
          <div className="error-msg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
            </svg>
            <p>{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="success-msg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z" />
            </svg>
            <p>{successMsg}</p>
          </div>
        )}

        <button onClick={handleEmailAuth}>
          <p>{isSignup ? "Sign up" : "Sign in"}</p>
        </button>

        <div className="sign-up">
          <p>
            {isSignup ? "Already have an account?" : "Don't have an account?"}
          </p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsSignup(!isSignup);
              setErrorMsg("");
            }}
          >
            {isSignup ? "Login" : "Sign up"}
          </a>
        </div>
      </div>
    </div>
  );
}
