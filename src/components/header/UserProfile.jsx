import React from "react";
import "./UserProfile.css";

export default function UserProfile({ user, toggleDropdown }) {
  return (
    <>
      <div className="dropdown-overlay" onClick={toggleDropdown}></div>
      <div className="dropdown-user">
        <div className="close-btn" onClick={toggleDropdown}>
          <h6>✕</h6>
        </div>

        <img src={user.imageUrl ?? "/images/default_profile.png"} />

        <div className="user-section">
          <p className="label">Username</p>
          <div className="user-info">{user.name ?? "Guest"}</div>
        </div>

        <div className="user-section">
          <p className="label">Email</p>
          <div className="user-info">{user.email ?? "Error: no email"}</div>
        </div>

        <button className="edit-profile-btn">
          <p>Edit profile</p>
        </button>
        <button className="change-pw-btn">
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
