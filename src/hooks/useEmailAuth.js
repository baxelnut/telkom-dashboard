import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../services/firebase/firebase";

const API_URL = import.meta.env.VITE_API_URL;

export function useEmailAuth({ setUser, setRole, isApprovedUser }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showError = (text) => setMessage({ type: "error", text });
  const showSuccess = (text) => setMessage({ type: "success", text });

  const mapError = (err) => {
    const code = err.code || "";
    if (code.includes("email-already-in-use"))
      return "Email already registered.";
    if (code.includes("invalid-email")) return "Invalid email format.";
    if (code.includes("user-not-found"))
      return "No account found with that email.";
    if (code.includes("wrong-password") || code.includes("invalid-credential"))
      return "Incorrect email or password.";
    if (code.includes("network-request-failed"))
      return "Check your internet connection.";
    return err.message || "Something went wrong.";
  };

  const loginOrSignup = async ({
    email,
    password,
    rememberMe,
    isSignup,
    firstName,
    lastName,
    telegramId,
  }) => {
    // Common required fields
    let requiredFields = [
      { key: "email", label: "Email" },
      { key: "password", label: "Password" },
    ];

    // Extra required fields for signup
    if (isSignup) {
      requiredFields.push(
        { key: "firstName", label: "First name" },
        { key: "lastName", label: "Last name" },
        { key: "telegramId", label: "Telegram ID" }
      );
    }

    // Check missing field
    for (let field of requiredFields) {
      if (!eval(field.key) || String(eval(field.key)).trim() === "") {
        return showError(`${field.label} is required.`);
      }
    }
    
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      let cred;
      if (isSignup) {
        // create auth user
        cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        // tell backend to create user doc using uid as docId
        const res = await fetch(`${API_URL}/admin/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, email, firstName, lastName, telegramId }),
        });

        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          json = { raw: text };
        }

        console.log("[useEmailAuth] register response:", res.status, json);

        if (!res.ok) {
          // backend failed: delete the newly created auth user to avoid orphaned accounts
          try {
            await cred.user.delete();
          } catch (delErr) {
            console.error("Failed to delete orphaned auth user:", delErr);
          }
          throw new Error(json?.error || "Registration failed.");
        }

        localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
        return showSuccess("Please wait for admin approval.");
      } else {
        cred = await signInWithEmailAndPassword(auth, email, password);
      }

      // Check admin role
      const adminsRes = await fetch(`${API_URL}/admin/all-admins`);
      if (!adminsRes.ok) throw new Error("Failed to fetch admin data.");
      const { data: admins } = await adminsRes.json();
      const isAdmin = admins.some(
        (a) => a.email === cred.user.email && a.role === "admin"
      );
      setRole(isAdmin ? "admin" : "user");

      if (!isApprovedUser && !isAdmin) {
        throw new Error("Access denied. Pending approval.");
      }

      // Verify token
      const token = await cred.user.getIdToken();
      const verifyRes = await fetch(`${API_URL}/auth/verify-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: cred.user.email }),
      });
      if (!verifyRes.ok) throw new Error("Access denied. Not authorized.");

      setUser(cred.user);
      return true; // signal navigation
    } catch (err) {
      showError(mapError(err));
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    if (!email) return showError("Please enter your email.");
    try {
      await sendPasswordResetEmail(auth, email);
      showSuccess("Reset email sent! Check your inbox.");
    } catch (err) {
      showError(
        err.code?.includes("invalid-email")
          ? "Invalid email."
          : "Failed to send reset email."
      );
    }
  };

  return { loading, message, loginOrSignup, forgotPassword };
}
