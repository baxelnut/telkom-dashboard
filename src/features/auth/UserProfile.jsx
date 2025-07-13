import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  updateProfile,
  updateEmail,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
// Style
import "./UserProfile.css";
// Components
import Button from "../../components/ui/buttons/Button";
// Context
import { useAuth } from "../../context/AuthContext";
// Data
import { SVG_PATHS } from "../../data/utilData";

export default function UserProfile({ user, showProfile }) {
  const navigate = useNavigate();
  const { setUser, setIsAdmin } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [editedUser, setEditedUser] = useState({
    name: user.name || "",
    email: user.email || "",
    imageUrl: user.imageUrl || "/images/default_profile.png",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setEditedUser((prev) => ({
      ...prev,
      imageUrl: URL.createObjectURL(file),
    }));
  };

  const uploadImageIfNeeded = async (uid) => {
    if (!imageFile) return editedUser.imageUrl;

    const storage = getStorage();
    const ref = storageRef(storage, `profileImages/${uid}`);
    await uploadBytes(ref, imageFile);
    return await getDownloadURL(ref);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const photoURL = await uploadImageIfNeeded(currentUser.uid);

      await updateProfile(currentUser, {
        displayName: editedUser.name,
        photoURL,
      });

      if (editedUser.email !== currentUser.email) {
        await updateEmail(currentUser, editedUser.email);
      }

      const db = getFirestore();
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", currentUser.email)
      );
      const snapshot = await getDocs(userQuery);
      if (snapshot.empty) throw new Error("User not found in Firestore");

      await updateDoc(snapshot.docs[0].ref, {
        fullName: editedUser.name,
        imageUrl: photoURL,
      });

      alert("Profile updated!");
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser?.email) return alert("No email found");

    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      alert("Password reset email sent!");
    } catch (err) {
      console.error("Password reset failed:", err);
      alert("Error: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem("user");
      localStorage.removeItem("isAdmin");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Error logging out. Try again.");
    }
  };

  return (
    <>
      <div className="dropdown-overlay" onClick={showProfile}></div>
      <div className="dropdown-user">
        <div className="close-btn-container">
          <Button
            iconPath={SVG_PATHS.xLarge}
            iconSize={28}
            onClick={showProfile}
            textColor="var(--text)"
            backgroundColor="var(--card)"
            hoverBackgroundColor="var(--error)"
          />
        </div>

        <img src={editedUser.imageUrl} referrerPolicy="no-referrer" />
        {isEditing && (
          <input type="file" accept="image/*" onChange={handleFileChange} />
        )}

        <div className="user-section">
          <p className="small-p">Username</p>
          {isEditing ? (
            <input
              className="user-info"
              type="text"
              name="name"
              value={editedUser.name}
              onChange={handleInputChange}
            />
          ) : (
            <div className="user-info">
              <h6 className="small-h">{user?.name || "Guest"}</h6>
            </div>
          )}
        </div>
        <div className="user-section">
          <p className="small-p">Email</p>
          <div className="user-info">
            <h6 className="small-h">{user?.email || "Unauthenticated"}</h6>
          </div>
        </div>

        <Button
          className="edit-profile-btn"
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          text={isSaving ? "Saving..." : isEditing ? "Save" : "Edit profile"}
          fullWidth
          disabled={isSaving}
        />
        <Button
          className="change-pw-btn"
          onClick={handlePasswordReset}
          text="Change password"
          fullWidth
        />
        <Button
          className="sign-out-btn"
          onClick={handleLogout}
          text="Sign out"
          fullWidth
          backgroundColor="var(--error)"
          hoverBackgroundColor="var(--card)"
          hoverTextColor="var(--error)"
        />
      </div>
    </>
  );
}
