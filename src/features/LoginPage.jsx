import { useEffect, useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/firebase/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const auth = getAuth();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (user && go == true) navigate("/overview");
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/overview");
    } catch (err) {
      console.error("Login error:", err.message);
    }
  };

  const handleGo = () => {
    setGo(true);
    console.log(go);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img className="logo" src="/TLK.svg" alt="logo" />

        <div className="login-header">
          <p>Please login/sign up to proceed</p>
          <h3>Welcome back!</h3>
        </div>

        <input type="email" name="" id="" placeholder="Email" />
        <input type="password" name="" id="" placeholder="Password" />

        <div className="helper-container">
          <div className="remember-me">
            <input className="checkbox" type="checkbox" name="" id="" />
            <p>Remember me</p>
          </div>
          <a href="">Forget Password?</a>
        </div>

        <button onClick={handleLogin}>
          <p>Login with Google</p>
        </button>
        <button onClick={handleGo}>
          <p>Continue</p>
        </button>
      </div>
    </div>
  );
}
