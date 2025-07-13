import { useEffect, useState } from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";
// Style
import "./Header.css";
// Components
import Icon from "../ui/icons/Icon";
import UserProfile from "../../features/auth/UserProfile";
// Data
import { SVG_PATHS } from "../../data/utilData";

const API_URL = import.meta.env.VITE_API_URL;

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
    displayName: user?.displayName || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "/images/default_profile.png",
  });

  const showProfile = () => {
    setShowDropdown((prev) => !prev);
  };

  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
  };

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
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
          displayName: userData.fullName || prev.displayName,
          email: userData.email || prev.email,
          photoURL: user.photoURL || "/images/default_profile.png",
        }));
      } catch (err) {
        console.error("🔥 Failed to fetch full user data:", err);
      }
    };

    if (user?.email) {
      fetchUserData();
    }
  }, [user?.email]);

  return (
    <div className="header-container">
      <div className="title">
        <h6>{title}</h6>
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
          src={userDisplay.photoURL}
          onClick={showProfile}
          referrerPolicy="no-referrer"
        />

        <h6 className="small-h name" onClick={showProfile}>
          {userDisplay.displayName || "Guest"}
        </h6>

        <Icon
          className="chevron-down"
          path={SVG_PATHS.chevronDown}
          style={{ cursor: "pointer" }}
          onClick={showProfile}
        />

        <Icon
          className="burger"
          path={SVG_PATHS.burger}
          onClick={onMenuClick}
        />

        {showDropdown && (
          <UserProfile user={userDisplay} showProfile={showProfile} />
        )}
      </div>
    </div>
  );
}
