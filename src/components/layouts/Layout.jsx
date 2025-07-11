import { useState } from "react";
import { useLocation } from "react-router-dom";
// Style
import "./Layout.css";
// Components
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";
// Custom hooks
import { useAuth } from "../../context/AuthContext";

const routeTitleMap = {
  "/": "Overview",
  "/overview": "Overview",
  "/reports/aosodomoro": "AOSODOMORO",
  "/reports/galaksi": "GALAKSI",
  "/action-based": "Action-Based",
  "/admin-panel": "Admin Panel",
};

export default function Layout({ children }) {
  const location = useLocation();
  const { user } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

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
          title={routeTitleMap[location.pathname]}
          user={user}
          onMenuClick={handleMenuClick}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        <main className="content">{children}</main>
        <Footer isMobileMenuOpen={isMobileMenuOpen} />
      </div>
    </div>
  );
}
