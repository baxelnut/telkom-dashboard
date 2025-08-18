import { useState, useEffect } from "react";
// Style
import "./Layout.css";
// Components
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";
// Context
import { useAuth } from "../../context/AuthContext";

export default function Layout({ pageTitle, children, API_URL }) {
  const { userData } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  useEffect(() => {
    if (!userData) {
      setShowDropdown(false);
      return;
    }
    if (!userData.telegramId || userData.telegramId == "") {
      setShowDropdown(true); // If telegramId is missing -> force open the profile dropdown
    } else {
      setShowDropdown(false); // If user has telegramId, make sure the dropdown is closed by default
    }
  }, [userData]);

  return (
    <div className="layout">
      <Sidebar
        isCollapsed={isCollapsed}
        onCollapseChange={setIsCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={setIsMobileMenuOpen}
      />
      <div className={`content-container ${isCollapsed ? "collapsed" : ""}`}>
        <Header
          title={pageTitle}
          userData={userData}
          onMenuClick={handleMenuClick}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
        />
        <main className="content">{children}</main>
        <Footer isMobileMenuOpen={isMobileMenuOpen} />
      </div>
    </div>
  );
}
