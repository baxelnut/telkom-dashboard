import { useEffect, useState } from "react";
import "./AdminPanel.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";
import { useAuth } from "../../services/firebase/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_DEV_API;

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, setIsAdmin } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error("🔥 Fetch error:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

      console.log("fuck 1");

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === userEmail ? { ...user, role: newRole } : user
        )
      );

      console.log("Current logged in email:", user?.email);
      console.log("Updated userEmail:", userEmail);
      console.log("New role:", newRole);

      if (user?.email === userEmail && newRole !== "admin") {
        console.log("fuck 2");
        setIsAdmin(false);
        console.log("isAdmin updated!");
        navigate("/overview");
      }
    } catch (err) {
      console.error("🚨 Failed to update role:", err);
      alert("Something went wrong while updating the role.");
    }
  };

  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error message={error} />;

  return (
    <div className="admin-panel">
      <div className="verify-container">
        <h5>Pending permission</h5>
        <div className="table-wrapper"></div>
      </div>

      <div className="panel-container">
        <h5>List of users</h5>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>
                  <h6>Role</h6>
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
              {users.map((user, i) => {
                const newRole = user.role === "admin" ? "user" : "admin";
                return (
                  <tr key={user.id}>
                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                    <td>
                      <h6 className={`role-badge ${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </h6>
                    </td>
                    <td>
                      <p>{user.email}</p>
                    </td>
                    <td>
                      <p>{user.id}</p>
                    </td>
                    <td>
                      <button
                        onClick={() => updateUserRole(user.email, newRole)}
                      >
                        <h6>{`Set as ${newRole}`}</h6>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
