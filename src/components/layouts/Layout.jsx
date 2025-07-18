import { useState } from "react";
// Style
import "./Layout.css";
// Components
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";
// Context
import { useAuth } from "../../context/AuthContext";

export default function Layout({ pageTitle, children, API_URL }) {
  const { user } = useAuth();

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
          user={user}
          onMenuClick={handleMenuClick}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          API_URL={API_URL}
        />

        <main className="content">{children}</main>

        <Footer isMobileMenuOpen={isMobileMenuOpen} />
      </div>
    </div>
  );
}
