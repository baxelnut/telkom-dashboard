import React, { useState } from "react";
import "./UserProfile.css";
import { getAuth, updateProfile, updateEmail } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UserProfile({ user, showProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user.name || "",
    email: user.email || "",
    imageUrl: user.imageUrl || "/images/default_profile.png",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      const previewURL = URL.createObjectURL(e.target.files[0]);
      setEditedUser((prev) => ({ ...prev, imageUrl: previewURL }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      let photoURL = editedUser.imageUrl;

      if (imageFile) {
        const storage = getStorage();
        const imageRef = ref(storage, `profileImages/${currentUser.uid}`);
        await uploadBytes(imageRef, imageFile);
        photoURL = await getDownloadURL(imageRef);
      }

      await updateProfile(currentUser, {
        displayName: editedUser.name,
        photoURL,
      });

      if (editedUser.email !== currentUser.email) {
        await updateEmail(currentUser, editedUser.email);
      }

      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("🔥 Failed to update profile:", err);
      alert("Error: " + err.message);
    }
    setIsSaving(false);
  };

  return (
    <>
      <div className="dropdown-overlay" onClick={showProfile}></div>
      <div className="dropdown-user">
        <div className="close-btn" onClick={showProfile}>
          <h6>✕</h6>
        </div>

        <img
          src={editedUser.imageUrl}
          style={{ borderRadius: "50%", width: "100px", height: "100px" }}
          referrerPolicy="no-referrer"
        />
        {isEditing && (
          <input
            className="user-info"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        )}

        <div className="user-section">
          <p className="label">Username</p>
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
              <h6>{user.name ?? "Guest"}</h6>
            </div>
          )}
        </div>

        <div className="user-section">
          <p className="label">Email</p>
          <div className="user-info">
            <h6>{user.email ?? "No email"}</h6>
          </div>
        </div>

        {isEditing ? (
          <button
            className="edit-profile-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            <p>{isSaving ? "Saving..." : "Save"}</p>
          </button>
        ) : (
          <button
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            <p>Edit profile</p>
          </button>
        )}

        <button
          className="change-pw-btn"
          onClick={() => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user || !user.email) {
              alert("No email found. Cannot send reset link.");
              return;
            }

            import("firebase/auth").then(({ sendPasswordResetEmail }) => {
              sendPasswordResetEmail(auth, user.email)
                .then(() => {
                  alert("✅ Password reset email sent!");
                })
                .catch((err) => {
                  console.error("🔥 Failed to send reset email:", err);
                  alert("Error: " + err.message);
                });
            });
          }}
        >
          <p>Change password</p>
        </button>

        <button
          className="sign-out-btn"
          onClick={() => {
            import("firebase/auth").then(({ getAuth, signOut }) => {
              signOut(getAuth());
            });
          }}
        >
          <p>Sign out</p>
        </button>
      </div>
    </>
  );
}
