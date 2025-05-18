import { useEffect, useState } from "react";
import "./Header.css";
import UserProfile from "./UserProfile";
import { DarkModeSwitch } from "react-toggle-dark-mode";

const API_URL = import.meta.env.VITE_API_URL;
const DEV_API_URL = import.meta.env.VITE_DEV_API;

export default function Header({
  title,
  user,
  onMenuClick,
  showDropdown,
  setShowDropdown,
  isDarkMode,
  setIsDarkMode,
}) {
  const [userDisplay, setUserDisplay] = useState({
    name: user.name || "",
    email: user.email || "",
    imageUrl: user.imageUrl || "/images/default_profile.png",
  });

  const showProfile = () => {
    setShowDropdown((prev) => !prev);
  };

  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(
          `${API_URL}/admin/user-info?email=${user.email}`
        );
        if (!res.ok) throw new Error("Failed to fetch user data");

        const json = await res.json();
        const userData = json.data;

        setUserDisplay((prev) => ({
          ...prev,
          name: userData.fullName || prev.name,
          email: userData.email || prev.email,
          imageUrl: user.imageUrl || "/images/default_profile.png",
        }));
      } catch (err) {
        console.error("🔥 Failed to fetch full user data:", err);
      }
    };

    if (user?.email) {
      fetchUserData();
    }
  }, [user.email]);

  return (
    <div className="header-container">
      <div className="title">
        <h5>{title}</h5>
      </div>

      <div className="profile">
        <div className="toggle-mode">
          <DarkModeSwitch
            checked={isDarkMode}
            onChange={toggleDarkMode}
            size={20}
          />
        </div>

        <img
          className="picture"
          src={user.imageUrl ?? "/images/default_profile.png"}
          onClick={showProfile}
          referrerPolicy="no-referrer"
        />

        <p className="name" onClick={showProfile}>
          {userDisplay.name ?? userDisplay.email ?? "..."}
        </p>

        <svg
          className="chevron-down"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 16 16"
          onClick={showProfile}
          style={{ cursor: "pointer" }}
        >
          <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
        </svg>

        <svg
          className="logo"
          onClick={onMenuClick}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
        </svg>

        {showDropdown && (
          <UserProfile user={userDisplay} showProfile={showProfile} />
        )}
      </div>
    </div>
  );
}
