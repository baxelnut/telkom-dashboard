import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase/firebase";
// Style
import "./UserProfile.css";
// Components
import Button from "../../components/ui/buttons/Button";
import InputField from "../../components/ui/input/InputField";
// Data
import { SVG_PATHS } from "../../data/utilsData";

export default function UserProfile({ userData, showProfile }) {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedUser, setEditedUser] = useState({
    fullName: userData?.fullName || "",
    teleUsername: userData?.teleUsername || "",
  });

  const [showTelegramReminder, setShowTelegramReminder] = useState(false);

  useEffect(() => {
    if (
      !userData?.teleUsername &&
      !localStorage.getItem("telegramReminderShown")
    ) {
      setShowTelegramReminder(true);
      localStorage.setItem("telegramReminderShown", "true");
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userData?.id) return alert("No user document found.");
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", userData.id);
      await updateDoc(userRef, {
        fullName: editedUser.fullName.trim(),
        teleUsername: editedUser.teleUsername.trim(),
      });
      setIsEditing(false);
      setShowTelegramReminder(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
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
      await signOut(auth);
      localStorage.clear();
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
        <div className="user-section-container">
          <div className="close-btn-container">
            <Button
              iconPath={SVG_PATHS.xLarge}
              iconSize={28}
              onClick={showProfile}
              textColor="var(--text)"
              backgroundColor="var(--card)"
              hoverBackgroundColor="var(--danger)"
            />
          </div>

          <img
            src={userData?.imageUrl || "/images/default_profile.png"}
            alt="Profile"
          />

          {/* NAME */}
          <div className="user-section">
            <p className="small-p">Name</p>
            {isEditing ? (
              <InputField
                type="text"
                name="fullName"
                value={editedUser.fullName}
                onChange={handleInputChange}
                fullWidth
              />
            ) : (
              <div className="user-info">
                <h6 className="small-h">{userData?.fullName || "Guest"}</h6>
              </div>
            )}
          </div>

          {/* TELEGRAM */}
          <div className="user-section">
            <p className="small-p">Telegram</p>
            {isEditing ? (
              <InputField
                type="text"
                name="teleUsername"
                placeholder="Enter your Telegram username"
                value={editedUser.teleUsername}
                onChange={handleInputChange}
                fullWidth
                isUsername
              />
            ) : (
              <div
                className="user-info"
                style={{
                  backgroundColor: !userData?.teleUsername
                    ? "rgba(var(--danger-rgb), 0.25)"
                    : "var(--bg)",
                }}
              >
                <h6
                  className="small-h"
                  style={{
                    color: !userData?.teleUsername
                      ? "var(--danger)"
                      : "var(--text)",
                  }}
                >
                  {userData?.teleUsername || "Please add your Telegram username"}
                </h6>
              </div>
            )}
          </div>

          {/* EMAIL */}
          <div className="user-section">
            <p className="small-p">Email</p>
            <div className="user-info">
              <h6 className="small-h">
                {userData?.email || "Unauthenticated"}
              </h6>
            </div>
          </div>
        </div>

        <div className="drop-btn-container">
          <Button
            className="edit-profile-btn"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            text={
              isSaving
                ? "Saving..."
                : isEditing
                ? "Save"
                : userData?.teleUsername
                ? "Edit profile"
                : "Add Telegram"
            }
            backgroundColor={
              userData?.teleUsername ? "var(--primary-variant)" : "#0088cc"
            }
            fullWidth
            disabled={isSaving}
          />
          <Button
            className="change-pw-btn"
            onClick={handlePasswordReset}
            text="Change password"
            fullWidth
            disabled={isSaving}
          />
          <Button
            className="sign-out-btn"
            onClick={handleLogout}
            text="Sign out"
            fullWidth
            textColor="white"
            hoverTextColor="var(--danger)"
            backgroundColor="var(--danger)"
            hoverBackgroundColor="rgba(var(--card-rgb), 0.75)"
            disabled={isSaving}
          />
        </div>
      </div>
    </>
  );
}
