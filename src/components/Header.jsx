import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Header.css";
import "../features/overview/OverViewPage.css";

export default function Header({
  title,
  showFilter = true,
  customActions = null,
  onExpandChange,
  filters = [],
  user = {
    imageUrl:
      "https://media.licdn.com/dms/image/v2/D5603AQEOUn3wMVGnGQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1701105430319?e=1746057600&v=beta&t=UpXVCVR_jttTVKh1Q-YsfJ-1_3kwWzKCTVmiKwdGi6A",
    name: "Basilius Tengang",
  },
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/overview") {
      setIsExpanded(false);
    }
  }, [location.pathname]);

  const toggleFilter = () => {
    setIsExpanded((prev) => {
      const newState = !prev;
      onExpandChange?.(newState);
      return newState;
    });
  };

  const groupedFilters = filters.reduce(
    (acc, filter) => {
      if (filter.id <= 6) acc.section1.push(filter);
      else acc.section2.push(filter);
      return acc;
    },
    { section1: [], section2: [] }
  );

  return (
    <div className={`header ${isExpanded ? "expanded" : ""}`}>
      <div className="header-content">
        <h2>{title}</h2>
        <div className="actions">
          {showFilter && (
            <button className="filter" type="button" onClick={toggleFilter}>
              <svg
                className="filter-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
              </svg>
              <h6>Filter</h6>
            </button>
          )}
          {customActions && (
            <div className="custom-actions">{customActions}</div>
          )}
          <div className="profile">
            <img className="picture" src={user.imageUrl} alt="Profile" />
            <h6>{user.name}</h6>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="chevron-down"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
              />
            </svg>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="sections">
          {["section1", "section2"].map((section) =>
            groupedFilters[section].length > 0 ? (
              <div key={section} className={section}>
                {groupedFilters[section].map((filter) => (
                  <div key={filter.id} className="build-filter">
                    <p>{filter.name}</p>
                    <div className="select-filter">
                      <h6>{filter.select}</h6>
                      {filter.id <= 6 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          className="chevron-down"
                          viewBox="0 0 16 16"
                          width="20"
                          height="20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null
          )}

          <div className="filter-actions">
            <button className="clear" type="button" onClick={toggleFilter}>
              <h6>Clear Filter</h6>
            </button>
            <button className="confirm" type="button" onClick={toggleFilter}>
              <h6>Confirm</h6>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
