import { useEffect, useState } from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";
// Style
import "./Header.css";
// Components
import Icon from "../ui/icons/Icon";
import UserProfile from "../../features/auth/UserProfile";
// Context
import { useTheme } from "../../context/ThemeContext";
// Data
import { SVG_PATHS } from "../../data/utilData";

export default function Header({
  title,
  user,
  onMenuClick,
  showDropdown,
  setShowDropdown,
  API_URL,
}) {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [userDisplay, setUserDisplay] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    photoURL: "/images/default_profile.png",
  });

  const showProfile = () => {
    setShowDropdown((prev) => !prev);
  };

  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(
          `${API_URL}/admin/user-info?email=${encodeURIComponent(user.email)}`
        );
        const raw = await res.clone().text();
        if (!res.ok) {
          let errText; // parse json error if backend returns json
          try {
            errText = await res.json();
          } catch (e) {
            errText = raw;
          }
          throw new Error(
            "Failed to fetch user data: " + (errText?.message || errText)
          );
        }
        const json = await res.json();
        const userData = json.data;
        setUserDisplay((prev) => ({
          ...prev,
          fullName: userData.fullName || prev.fullName,
          email: userData.email || prev.email,
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
          alt="Profile"
        />

        <h6 className="small-h name" onClick={showProfile}>
          {userDisplay.fullName || "Guest"}
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
