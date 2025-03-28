import React from "react";
import { useLocation } from "react-router-dom";
import "./Header.css";

export default function Header({ title, user, onMenuClick }) {
  const location = useLocation();

  return (
    <div className="header-container">
      <div className="title" onClick={onMenuClick}>
        <svg
          className="logo"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
          />
        </svg>
        <h5>{title}</h5>
      </div>

      <div className="profile">
        <img className="picture" src={user.imageUrl} alt="Profile" />
        <p className="name">{user.name}</p>
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
  );
}
