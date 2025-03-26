import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Header.css";

export default function Header({ title, user }) {
  const location = useLocation();

  return (
    <div className="header-container">
      <h2>{title}</h2>
      <div className="profile">
        <img className="picture" src={user.imageUrl} alt="Profile" />
        <h6 className="name">{user.name}</h6>
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
