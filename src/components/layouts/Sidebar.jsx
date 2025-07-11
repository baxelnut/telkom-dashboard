import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
// Style
import "./Sidebar.css";
// Components
import ChevronIcon from "../ui/icons/ChevronIcon";
import Icon from "../ui/icons/Icon";
// Data
import { SIDEBAR_MENUS } from "../../data/navData";
import { SVG_PATHS } from "../../data/utilData";

export default function Sidebar({
  links = SIDEBAR_MENUS,
  onCollapseChange,
  onMobileMenuToggle,
}) {
  const location = useLocation();
  const sidebarRef = useRef(null);

  const [openLabel, setOpenLabel] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [showBurger, setShowBurger] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(window.scrollY);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Show burger if scrolling up or near top, hide if scrolling down
      if (currentY < lastScrollY || currentY < 40) {
        setShowBurger(true);
      } else {
        setShowBurger(false);
      }

      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
        if (onMobileMenuToggle) onMobileMenuToggle(false);
        setIsCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        isMobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setIsMobileMenuOpen(false);
        if (onMobileMenuToggle) onMobileMenuToggle(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isMobileMenuOpen]);

  // Auto-open submenu for current route
  useEffect(() => {
    const active = links.find(({ children }) =>
      children?.some(({ path }) => location.pathname.startsWith(path))
    );
    if (active) setOpenLabel(active.label);
  }, [location.pathname, links]);

  const toggleMenu = (label) => {
    setOpenLabel((prev) => (prev === label ? null : label));
  };

  const handleNavClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
      if (onMobileMenuToggle) onMobileMenuToggle(false);
    }
  };

  const renderChildren = (children, parentLabel) => {
    const isOpen = openLabel === parentLabel;
    return (
      <ul className={`sidebar-submenu ${isOpen ? "submenu-open" : ""}`}>
        {children.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-sublabel ${isActive ? "active" : ""}`
            }
            onClick={handleNavClick}
          >
            <p>{label}</p>
          </NavLink>
        ))}
      </ul>
    );
  };

  const handleToggleCollapse = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    if (onCollapseChange) onCollapseChange(newVal);
  };

  return (
    <>
      {isMobile && !isMobileMenuOpen && showBurger && (
        <button
          className={`burger-btn ${showBurger ? "" : "hidden"}`}
          onClick={() => {
            setIsMobileMenuOpen(true);
            if (onMobileMenuToggle) onMobileMenuToggle(true);
          }}
        >
          <Icon
            path={SVG_PATHS.burger}
            width={24}
            height={24}
            fill="var(--text)"
          />
        </button>
      )}

      <nav
        ref={sidebarRef}
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobileMenuOpen ? "mobile-open" : ""
        }`}
      >
        <ul className="sidebar-menu">
          <div className="sidebar-header">
            <Link to="/" className="sidebar-logo" onClick={handleNavClick}>
              <img src="/logos/telkom.svg" alt="Telkom" />
            </Link>
          </div>

          {links.map(({ label, path, leading, children }) => {
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
                              className={`chevron ${
                                isOpen ? "rotate-down" : ""
                              }`}
                              direction="right"
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
                    className={({ isActive }) =>
                      `sidebar-link${isActive ? " active" : ""}`
                    }
                    onClick={handleNavClick}
                  >
                    <Icon className="sidebar-icon" path={leading} />
                    {!isCollapsed && <p className="sidebar-label">{label}</p>}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>

        {!isMobile && (
          <div className="collapse-btn" onClick={handleToggleCollapse}>
            <ChevronIcon
              direction={isCollapsed ? "right" : "left"}
              width={18}
              height={18}
              fill="var(--text)"
            />
          </div>
        )}
      </nav>
    </>
  );
}
