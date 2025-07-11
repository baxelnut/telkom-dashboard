import { useState } from "react";
// Style
import "./AdminPanelPage.css";
// Components
import Dropdown from "../../components/ui/input/Dropdown";

export default function AdminPanelPage() {
  return (
    <div className="admin-panel-page">
      <div className="card admin pending">
        <h6>Pending Approval / Declined Accounts</h6>
      </div>

      <div className="card admin list">
        <h6>List of Users</h6>
      </div>
    </div>
  );
}
