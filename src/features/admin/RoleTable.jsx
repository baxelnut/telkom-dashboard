// Style
import "./RoleTable.css";
// Components
import Button from "../../components/ui/buttons/Button";
// Data
import { SVG_PATHS } from "../../data/utilData";

export default function RoleTable({
  users = [],
  showDeclined = false,
  onRoleChange,
  context,
}) {
  return (
    <table className="role-table">
      <thead>
        <tr>
          <th> {/* Numbers */}</th>
          <th>Role</th>
          <th>Name</th>
          <th>Email</th>
          <th>User ID</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, i) => {
          const { role, email, fullName, id } = user;
          const newRole = role === "admin" ? "user" : "admin";
          const capitalizedRole =
            role?.charAt(0).toUpperCase() + role?.slice(1);

          return (
            <tr key={id}>
              <td style={{ textAlign: "center" }}>{i + 1}</td>
              <td
                className={`${
                  role === "admin" || context != "approved" ? "role" : ""
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
                <p>{id}</p>
              </td>
              <td>
                <div className="btn-container">
                  {context === "pending" ? (
                    <>
                      <Button
                        text="Accept"
                        iconPath={SVG_PATHS.checkLarge}
                        onClick={() => onRoleChange(email, "user")}
                        backgroundColor="var(--success)"
                        iconAfter
                        short
                      />
                      {!showDeclined && (
                        <Button
                          text="Decline"
                          iconPath={SVG_PATHS.xLarge}
                          onClick={() => onRoleChange(email, "declined")}
                          backgroundColor="var(--error)"
                          iconAfter
                          short
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        text={`Set as ${newRole}`}
                        iconPath={SVG_PATHS[newRole]}
                        onClick={() => onRoleChange(email, newRole)}
                        short
                        hollow={newRole === "user"}
                      />
                      <Button
                        text="Revoke access"
                        iconPath={SVG_PATHS.xLarge}
                        onClick={() => onRoleChange(email, "waiting approval")}
                        backgroundColor="var(--error)"
                        short
                      />
                    </>
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
