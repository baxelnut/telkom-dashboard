import { DarkModeSwitch } from "react-toggle-dark-mode";
// Style
import "./Header.css";
// Components
import Icon from "../ui/icons/Icon";
import UserProfile from "../../features/auth/UserProfile";
// Context
import { useTheme } from "../../context/ThemeContext";
// Data
import { SVG_PATHS } from "../../data/utilsData";

export default function Header({
  title,
  userData,
  onMenuClick,
  showDropdown,
  setShowDropdown,
}) {
  const { isDarkMode, setIsDarkMode } = useTheme();

  const showProfile = () => {
    setShowDropdown((prev) => !prev);
  };

  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
  };

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
          src={userData.imageUrl || "/images/default_profile.png"}
          onClick={showProfile}
          alt="Profile"
        />

        <h6 className="small-h name" onClick={showProfile}>
          {userData.fullName || "Guest"}
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
          <UserProfile userData={userData} showProfile={showProfile} />
        )}
      </div>
    </div>
  );
}
