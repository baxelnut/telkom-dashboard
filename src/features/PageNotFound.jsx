import React from "react";
import { Link } from "react-router-dom";
import "./PageNotFound.css";

export default function PageNotFound() {
  return (
    <div className="page-not-found">
      <h1>404</h1>
      <h5>Page Not Found</h5>
      <Link to="/overview">
        <p>Back to Dashboard</p>
      </Link>
    </div>
  );
}
