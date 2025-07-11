import { useState } from "react";
// Style
import "./AdminPanelPage.css";
// Components
import Button from "../../components/ui/buttons/Button";
import Dropdown from "../../components/ui/input/Dropdown";
// Data
import { SVG_PATHS } from "../../data/utilData";

export default function AdminPanelPage() {
  const [selectedRole, setSelectedRole] = useState("");

  const options = [
    { label: "Select Role", value: "" },
    { label: "Admin", value: "admin" },
    { label: "Editor", value: "editor" },
    { label: "Viewer", value: "viewer" },
  ];

  return (
    <div className="admin-panel-page">
      <h6>Admin Panel Page</h6>

      <Dropdown
        options={options}
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        short
        trailingIcon={SVG_PATHS.chevronDown}
      />

      <p style={{ marginTop: "1rem" }}>
        Selected Role: <strong>{selectedRole || "None"}</strong>
      </p>

      <Button />
      <Button rounded />
      <Button short />
      <Button short rounded />
      <Button short rounded arrow />

      <Button hollow />
      <Button hollow rounded />
      <Button hollow short />
      <Button hollow short rounded />
      <Button hollow short rounded arrow />
    </div>
  );
}
