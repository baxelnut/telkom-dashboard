import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Header.css";
import "../features/overview/OverViewPage.css";

export default function Header({
  title,
  showFilter = true,
  customActions = null,
  onExpandChange,
}) {
  const imageUrl =
    "https://media.licdn.com/dms/image/v2/D5603AQEOUn3wMVGnGQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1701105430319?e=1746057600&v=beta&t=UpXVCVR_jttTVKh1Q-YsfJ-1_3kwWzKCTVmiKwdGi6A";
  const userName = "Basilius Tengang";

  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/overview") {
      setIsExpanded(false);
    }
  }, [location.pathname]);

  const toggleFilter = () => {
    setIsExpanded(!isExpanded);
    onExpandChange && onExpandChange(!isExpanded);
  };

  const filters = [
    { id: 1, name: "filterName", select: "selectFilter" },
    { id: 2, name: "filterName", select: "selectFilter" },
    { id: 3, name: "filterName", select: "selectFilter" },
    { id: 4, name: "filterName", select: "selectFilter" },
    { id: 5, name: "filterName", select: "selectFilter" },
    { id: 6, name: "filterName", select: "selectFilter" },
    { id: 7, name: "fieldName", select: "selectField" },
    { id: 8, name: "fieldName", select: "selectField" },
  ];

  return (
    <div className={`header ${isExpanded ? "expanded" : ""}`}>
      <div className="header-content">
        <h2>{title}</h2>
        <div className="actions">
          {showFilter && (
            <button className="filter" type="button" onClick={toggleFilter}>
              <img
                className="filter-icon"
                src="src/assets/icons/filter.svg"
                alt="Filter"
              />
              <h6>Filter</h6>
            </button>
          )}
          {customActions && (
            <div className="custom-actions">{customActions}</div>
          )}
          <div className="profile">
            <img className="picture" src={imageUrl} alt="Profile" />
            <h6>{userName}</h6>
            <img
              className="chevron-down"
              src="src/assets/icons/chevron-down.svg"
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="sections">
            <div className="section1">
              {filters
                .filter((filter) => filter.id >= 1 && filter.id <= 6)
                .map((filter) => (
                  <div key={filter.id} className="build-filter">
                    <p>{filter.name}</p>
                    <div className="select-filter">
                      <h6>{filter.select}</h6>
                      <img
                        className="chevron-down"
                        src="src/assets/icons/chevron-down.svg"
                      />
                    </div>
                  </div>
                ))}
            </div>

            <div className="section2">
              {filters
                .filter((filter) => filter.id >= 7 && filter.id <= 8)
                .map((filter) => (
                  <div key={filter.id} className="build-filter">
                    <p>{filter.name}</p>
                    <div className="select-filter">
                      <h6>{filter.select}</h6>
                    </div>
                  </div>
                ))}
              <button className="clear" type="button" onClick={toggleFilter}>
                <h6>Clear Filter</h6>
              </button>
              <button className="confirm" type="button" onClick={toggleFilter}>
                <h6>Confirm</h6>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
