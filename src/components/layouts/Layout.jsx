import { useState } from "react";
// Style
import "./Layout.css";
// Components
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";
// Custom hooks
import { useAuth } from "../../context/AuthContext";

export default function CreatorLayout({ children }) {
  const { user } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleMenuClick = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <div className="layout">
      <Sidebar
        onCollapseChange={setIsCollapsed}
        onMobileMenuToggle={setIsMobileMenuOpen}
      />
      <div className={`content-container ${isCollapsed ? "collapsed" : ""}`}>
        <Header
          title="Dashboard"
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
