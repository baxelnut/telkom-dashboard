import { useState, useEffect, useRef } from "react";
// Style
import "./RoleTable.css";
// Components
import Button from "../../components/ui/buttons/Button";
import Icon from "../../components/ui/icons/Icon";
import RolePopUpMenu from "./RolePopUpMenu";
// Data
import { SVG_PATHS } from "../../data/utilsData";

export default function RoleTable({
  API_URL,
  users = [],
  showDeclined = false,
  onRoleChange,
  context,
}) {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menuRef = useRef(null);

  // Close menu if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuIndex(null);
      }
    }
    if (openMenuIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuIndex]);

  async function handleDelete(uid) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${uid}`, {
        method: "DELETE",
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn("Response is not valid JSON.");
      }
      if (!res.ok) throw new Error(data?.error || "Failed to delete user");
      alert("User deleted successfully");
      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message);
    }
  }

  return (
    <table className="role-table">
      <thead>
        <tr>
          <th></th>
          <th>Role</th>
          <th>Name</th>
          <th>Email</th>
          <th>Telegram</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, i) => {
          const { role, email, fullName, uid, teleUsername } = user;
          const newRole = role === "admin" ? "user" : "admin";
          const capitalizedRole =
            role?.charAt(0).toUpperCase() + role?.slice(1);

          return (
            <tr key={uid}>
              <td style={{ textAlign: "center" }}>{i + 1}</td>
              <td
                className={`${
                  role === "admin" || context !== "approved" ? "role" : ""
                } unresponsive`}
              >
                <p>{capitalizedRole || "Unknown"}</p>
              </td>
              <td>
                <p>{fullName}</p>
              </td>
              <td>
                <p>{email}</p>
              </td>
              <td>
                <em>
                  {teleUsername ?? <span className="not-set">Not set</span>}
                </em>
              </td>
              <td className="action-td">
                <div className="btn-container">
                  {context === "pending" ? (
                    <>
                      <Button
                        text="Accept"
                        iconPath={SVG_PATHS.checkLarge}
                        onClick={() => onRoleChange(email, "user")}
                        backgroundColor="var(--safe)"
                        iconAfter
                        short
                      />
                      {!showDeclined ? (
                        <Button
                          text="Decline"
                          iconPath={SVG_PATHS.xLarge}
                          onClick={() => onRoleChange(email, "declined")}
                          backgroundColor="gray"
                          iconAfter
                          short
                        />
                      ) : (
                        <Button
                          text="Delete"
                          iconPath={SVG_PATHS.trash}
                          onClick={() => handleDelete(uid)}
                          backgroundColor="var(--danger)"
                          short
                        />
                      )}
                    </>
                  ) : (
                    <Icon
                      onClick={() =>
                        setOpenMenuIndex(openMenuIndex === i ? null : i)
                      }
                      className="icon-button"
                      path={SVG_PATHS.dotsVert}
                    />
                  )}

                  {openMenuIndex === i && (
                    <RolePopUpMenu
                      key={i}
                      uid={uid}
                      fullName={fullName}
                      email={email}
                      menuRef={menuRef}
                      newRole={newRole}
                      onRoleChange={onRoleChange}
                      handleDelete={handleDelete}
                    />
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
