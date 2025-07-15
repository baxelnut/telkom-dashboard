import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
// Style
import "./AdminPanelPage.css";
// Components
import Button from "../../components/ui/buttons/Button";
import CardContent from "../../components/ui/cards/CardContent";
import RoleTable from "../../features/admin/RoleTable";
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

  const navigate = useNavigate();
  const { user, setIsAdmin } = useAuth();
  const [users, setUsers] = useState([]);
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
              {(showDeclined ? declinedUsers : pendingUsers).length === 0 ? (
                <div className="empty-state">
                  <h6 className="small-h">
                    {showDeclined
                      ? "No declined users found."
                      : "No pending approvals yet."}
                  </h6>
                  <p className="small-p">
                    {showDeclined
                      ? "You’ve either accepted all or none were submitted."
                      : "Once users sign up and request access, they’ll appear here for approval."}
                  </p>
                </div>
              ) : (
                <RoleTable
                  users={showDeclined ? declinedUsers : pendingUsers}
                  showDeclined={showDeclined}
                  onRoleChange={updateUserRole}
                  context="pending"
                />
              )}
            </div>
          }
        />
      </div>

      <div className="card admin list">
        <h6>List of users</h6>
        <CardContent
          loading={loading}
          error={error}
          children={
            <div className="table-wrapper">
              <RoleTable
                users={approvedUsers}
                onRoleChange={updateUserRole}
                context="approved"
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
