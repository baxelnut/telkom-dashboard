import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
// Style
import "./AdminPanelPage.css";
// Components
import CardContent from "../../components/ui/cards/CardContent";
import Button from "../../components/ui/buttons/Button";
import Dropdown from "../../components/ui/input/Dropdown";
// Context
import { useAuth } from "../../context/AuthContext";
// Custom hook
import useFetchData from "../../hooks/useFetchData";
// Data
import { SVG_PATHS } from "../../data/utilData";

export default function AdminPanelPage({ API_URL }) {
  const {
    data: fetchedUsers,
    loading,
    error,
    refetch,
  } = useFetchData(`${API_URL}/admin/users`);
  const [users, setUsers] = useState([]);
  const { user, setIsAdmin } = useAuth();
  const navigate = useNavigate();
  const [showDeclined, setShowDeclined] = useState(false);

  useEffect(() => {
    if (fetchedUsers?.length) {
      setUsers(fetchedUsers);
    }
  }, [fetchedUsers]);

  const updateUserRole = async (userEmail, newRole) => {
    try {
      const res = await fetch(`${API_URL}/admin/set-role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update user role");
      setUsers((prev) =>
        prev.map((u) => (u.email === userEmail ? { ...u, role: newRole } : u))
      );
      if (user?.email === userEmail && newRole !== "admin") {
        setIsAdmin(false);
        navigate("/overview");
      }
      await refetch(); // Fully refresh from backend after mutation
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Something went wrong while updating the role.");
    }
  };

  const approvedUsers = users.filter(
    (u) => u.role === "admin" || u.role === "user"
  );
  const pendingUsers = users.filter(
    (u) => !["admin", "user", "declined"].includes(u.role)
  );
  const declinedUsers = users.filter((u) => u.role === "declined");

  return (
    <div className="admin-panel-page">
      <Helmet>
        <title>Admin Panel | Telkom</title>
        <meta
          name="description"
          content="Administrative tools for managing users, permissions, and configurations in the Telkom dashboard system."
        />
      </Helmet>

      <div className="card admin pending">
        <div className="heading-container">
          <h6>{showDeclined ? "Declined Accounts" : "Pending Approval"}</h6>
          <Button
            text={showDeclined ? "Show pending" : "Show declined"}
            onClick={() => setShowDeclined((prev) => !prev)}
            iconPath={
              showDeclined ? SVG_PATHS.hourglass : SVG_PATHS.personDeclined
            }
            iconAfter
            short
            hollow
          />
        </div>

        <CardContent
          loading={loading}
          error={error}
          children={
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>
                      <h6>Role</h6>
                    </th>
                    <th>
                      <h6>Name</h6>
                    </th>
                    <th>
                      <h6>Email</h6>
                    </th>
                    <th>
                      <h6>User ID</h6>
                    </th>
                    <th>
                      <h6>Action</h6>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(showDeclined ? declinedUsers : pendingUsers).map(
                    (user, i) => (
                      <tr key={user.id}>
                        <td style={{ textAlign: "center" }}>{i + 1}</td>
                        <td>
                          <h6
                            className={`role-badge ${user.role || "unknown"}`}
                          >
                            {user.role
                              ? user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)
                              : "Unknown"}
                          </h6>
                        </td>
                        <td>
                          <p>{user.fullName}</p>
                        </td>
                        <td>
                          <p>{user.email}</p>
                        </td>
                        <td>
                          <p>{user.id}</p>
                        </td>
                        <td>
                          <div className="btn-container">
                            <Button
                              text="Accept"
                              iconPath={SVG_PATHS.checkLarge}
                              onClick={() => updateUserRole(user.email, "user")}
                              backgroundColor="var(--success)"
                              iconAfter
                              short
                            />
                            {!showDeclined && (
                              <Button
                                text="Decline"
                                iconPath={SVG_PATHS.xLarge}
                                onClick={() =>
                                  updateUserRole(user.email, "declined")
                                }
                                backgroundColor="var(--error)"
                                iconAfter
                                short
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          }
        />
      </div>

      <div className="card admin list">
        <h6>List of Users</h6>
      </div>
    </div>
  );
}
