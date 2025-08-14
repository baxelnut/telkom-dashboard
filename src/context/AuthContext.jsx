import { createContext, useEffect, useState, useContext } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getItem } from "../services/firebase/firestoreService";

const API_URL = import.meta.env.VITE_API_URL;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setRole(null);
        setUserData(null);
        setAuthLoading(false);
        return;
      }

      try {
        await fbUser.getIdToken(true);

        // Get role from backend
        const res = await fetch(
          `${API_URL}/admin/user-info/by-email?email=${encodeURIComponent(
            fbUser.email
          )}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch role");

        const userRole = json.data?.role;

        // Get Firestore user doc by email
        const fsUserDoc = await getItem("users", fbUser.email, "email");

        if (userRole === "waiting approval" || !userRole) {
          await signOut(getAuth());
          setUser(null);
          setRole(null);
          setUserData(null);
        } else {
          setUser(fbUser);
          setRole(userRole);
          setUserData(fsUserDoc || null);
        }
      } catch (err) {
        console.error("AuthContext error:", err);
        await signOut(getAuth());
        setUser(null);
        setRole(null);
        setUserData(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = role === "admin";
  const isApprovedUser = role === "admin" || role === "user";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        role,
        setRole,
        userData,
        isAdmin,
        isApprovedUser,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
