import { useState, useEffect, useRef } from "react";
import { useLocation, Link, NavLink } from "react-router-dom";
// Styles
import "./Sidebar.css";
// Components
import ChevronIcon from "../ui/icons/ChevronIcon";
import Icon from "../ui/icons/Icon";
import PingTool from "../utils/PingTool";
// Custom hook & context
import useLogoSrc from "../../hooks/useLogoSrc";
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
  const { isAdmin } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const getLogoSrc = useLogoSrc();
  const [logoSrc, setLogoSrc] = useState(getLogoSrc);
  const [openLabel, setOpenLabel] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Remove Admin Panel if not admin
  const filteredLinks = links.filter((item) => {
    if (item.label === "Admin Panel" && !isAdmin) return false;
    return true;
  });

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

  const toggleMenu = (label) => {
    if (isCollapsed && !isMobile) {
      onCollapseChange?.(false);
      // wait a frame so layout updates, then open submenu
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setOpenLabel((prev) => (prev === label ? null : label));
        });
      });
      return;
    }
    if (isMobile && !isMobileMenuOpen) {
      onMobileMenuToggle?.(true);
      setTimeout(
        () => setOpenLabel((prev) => (prev === label ? null : label)),
        60 // small delay so mobile menu has space to render
      );
      return;
    }
    setOpenLabel((prev) => (prev === label ? null : label)); // Normal toggle
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

        {!isCollapsed && <PingTool />}
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
