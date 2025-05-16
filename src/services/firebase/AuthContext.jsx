import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./index";

const API_URL = import.meta.env.VITE_API_URL;
const DEV_API_URL = import.meta.env.VITE_DEV_API;

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setRole(null);
        setAuthLoading(false);
        return;
      }

      try {
        // Force refresh the token to ensure latest backend claims
        await fbUser.getIdToken(true);

        // Re-fetch role from your backend using up-to-date token
        const res = await fetch(
          `${API_URL}/admin/user-info?email=${encodeURIComponent(fbUser.email)}`
        );
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Failed to fetch role");

        const userRole = json.data.role;

        if (userRole === "waiting approval") {
          await signOut(getAuth());
          setUser(null);
          setRole(null);
        } else {
          setUser(fbUser);
          setRole(userRole);
        }
      } catch (error) {
        console.error("AuthContext role fetch failed:", error);
        await signOut(getAuth());
        setUser(null);
        setRole(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isApprovedUser = role === "admin" || role === "user";
  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        authLoading,
        role,
        setRole,
        isAdmin,
        isApprovedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
