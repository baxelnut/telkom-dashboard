import { signInWithGoogle, logout } from "./auth";

function Auth() {
  return (
    <div>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Auth;
