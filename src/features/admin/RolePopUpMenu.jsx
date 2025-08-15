import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Style
import "./RolePopUpMenu.css";
// Components
import Button from "../../components/ui/buttons/Button";
// Custom hook
import { useEmailAuth } from "../../hooks/useEmailAuth";
// Data
import { SVG_PATHS } from "../../data/utilsData";

export default function RolePopUpMenu({
  uid,
  fullName,
  email,
  onRoleChange,
  menuRef,
  newRole,
  handleDelete,
}) {
  const navigate = useNavigate();
  const { forgotPassword, message } = useEmailAuth({});
  const [resetDisabled, setResetDisabled] = useState(false);

  const handleResetClick = async () => {
    await forgotPassword(email);
    setResetDisabled(true);
    setTimeout(() => setResetDisabled(false), 60 * 1000); // 1 min cooldown
  };

  return (
    <div className="popup-menu" ref={menuRef}>
      <h6 className="small-h">{fullName}</h6>
      <Button
        text="Details"
        iconPath={SVG_PATHS.inpo}
        onClick={() => navigate(`/admin-panel/${uid}`)}
        hollow
        short
        fullWidth
      />
      <Button
        text={`Set as ${newRole}`}
        iconPath={SVG_PATHS[newRole]}
        onClick={() => onRoleChange(email, newRole)}
        short
        hollow={newRole === "user"}
        fullWidth
      />
      <Button
        text="Revoke"
        iconPath={SVG_PATHS.xLarge}
        onClick={() => onRoleChange(email, "waiting approval")}
        backgroundColor="gray"
        short
        fullWidth
      />
      <Button
        text={resetDisabled ? "Sent to Email" : "Reset Password"}
        iconPath={SVG_PATHS.emailWarning}
        onClick={handleResetClick}
        backgroundColor="var(--text)"
        textColor="var(--bg)"
        short
        fullWidth
        disabled={resetDisabled}
      />
      <Button
        text="Delete"
        iconPath={SVG_PATHS.trash}
        onClick={() => handleDelete(uid)}
        backgroundColor="var(--danger)"
        short
        fullWidth
      />
      {message?.text && (
        <p className={`message ${message.type}`}>{message.text}</p>
      )}
    </div>
  );
}
