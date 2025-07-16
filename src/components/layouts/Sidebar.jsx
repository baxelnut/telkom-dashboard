import { useEffect, useRef, useState, useCallback } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
// Styles
import "./Sidebar.css";
// Components
import ChevronIcon from "../ui/icons/ChevronIcon";
import Icon from "../ui/icons/Icon";
// Context
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
// Data
import { SIDEBAR_MENUS } from "../../data/navData";

export default function Sidebar({
  links = SIDEBAR_MENUS,
  isCollapsed,
  onCollapseChange,
  isMobileMenuOpen,
  onMobileMenuToggle,
}) {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [openLabel, setOpenLabel] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { isDarkMode } = useTheme();
  const { isAdmin } = useAuth();

  const filteredLinks = links.filter((item) => {
    // Remove Admin Panel if not admin
    if (item.label === "Admin Panel" && !isAdmin) return false;
    return true;
  });

  //Get Logo Based on Mode + Screen
  const getLogoSrc = useCallback(() => {
    const isTabletUp = window.innerWidth >= 768;
    return isTabletUp
      ? isDarkMode
        ? "/logos/telkom-big-reverse.svg"
        : "/logos/telkom-big.svg"
      : isDarkMode
      ? "/logos/telkom-reverse.svg"
      : "/logos/telkom.svg";
  }, [isDarkMode]);

  const [logoSrc, setLogoSrc] = useState(getLogoSrc);

  // Update logo on dark mode toggle
  useEffect(() => {
    setLogoSrc(getLogoSrc());
  }, [getLogoSrc]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setLogoSrc(getLogoSrc());

      if (!mobile) {
        onMobileMenuToggle(false);
        onCollapseChange(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getLogoSrc, onMobileMenuToggle, onCollapseChange]);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        isMobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        onMobileMenuToggle(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isMobileMenuOpen, onMobileMenuToggle]);

  // Sync active menu on route change
  useEffect(() => {
    const active = links.find(({ children }) =>
      children?.some(({ path }) => location.pathname.startsWith(path))
    );
    if (active) setOpenLabel(active.label);
  }, [location.pathname, links]);

  // Helpers
  const toggleMenu = (label) => {
    setOpenLabel((prev) => (prev === label ? null : label));
  };

  const handleNavClick = () => {
    if (isMobile) onMobileMenuToggle(false);
  };

  const handleToggleCollapse = () => {
    onCollapseChange(!isCollapsed);
  };

  const renderChildren = (children, parentLabel) => {
    const isOpen = openLabel === parentLabel;
    return (
      <ul className={`sidebar-submenu ${isOpen ? "submenu-open" : ""}`}>
        {children.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `sidebar-sublabel ${isActive ? "active" : ""}`
            }
          >
            <p>{label}</p>
          </NavLink>
        ))}
      </ul>
    );
  };

  // Render
  return (
    <nav
      ref={sidebarRef}
      className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
        isMobileMenuOpen ? "mobile-open" : ""
      }`}
    >
      <ul className="sidebar-menu">
        {/* Logo */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={handleNavClick}>
            <img
              key={logoSrc}
              src={logoSrc}
              alt="Telkom Logo"
              className="sidebar-logo-img"
            />
          </Link>
        </div>

        {/* Menu */}
        {filteredLinks.map(({ label, path, leading, children }) => {
          const hasChildren = Array.isArray(children) && children.length > 0;
          const isOpen = openLabel === label;

          return (
            <li
              key={label}
              className={`sidebar-item ${hasChildren ? "has-children" : ""}`}
            >
              {hasChildren ? (
                <>
                  <div
                    className={`sidebar-link ${isOpen ? "active" : ""}`}
                    onClick={() => toggleMenu(label)}
                  >
                    <div className="sidebar-label-row">
                      <Icon path={leading} />
                      {!isCollapsed && (
                        <>
                          <p className="sidebar-label-title">{label}</p>
                          <ChevronIcon
                            className={`chevron ${isOpen ? "rotate-down" : ""}`}
                            direction="right"
                            width={14}
                            height={14}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  {!isCollapsed && renderChildren(children, label)}
                </>
              ) : (
                <NavLink
                  to={path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? " active" : ""}`
                  }
                >
                  <Icon className="sidebar-icon" path={leading} />
                  {!isCollapsed && <p className="sidebar-label">{label}</p>}
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>

      {/* Collapse button (desktop only) */}
      {!isMobile && (
        <div className="collapse-btn" onClick={handleToggleCollapse}>
          <ChevronIcon
            direction={isCollapsed ? "right" : "left"}
            width={18}
            height={18}
          />
        </div>
      )}
    </nav>
  );
}
