import { useEffect, useState } from "react";
import "./AdminPanel.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";
import { useAuth } from "../../services/firebase/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminPanel({ API_URL }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, setIsAdmin } = useAuth();
  const [showDeclined, setShowDeclined] = useState(false);

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

  const approvedUsers = users.filter(
    (u) => u.role === "admin" || u.role === "user"
  );

  const pendingUsers = users.filter(
    (u) => !["admin", "user", "declined"].includes(u.role)
  );

  const declinedUsers = users.filter((u) => u.role === "declined");

  return (
    <div className="admin-panel">
      <div className="verify-container">
        <div className="title-container">
          <h5>{showDeclined ? "Declined Accounts" : "Pending Approval"}</h5>
          <button onClick={() => setShowDeclined((prev) => !prev)}>
            {showDeclined ? "Show Pending Accounts" : "Show Declined Accounts"}
          </button>
        </div>

        <div className="table-wrapper">
          {loading || error ? (
            loading ? (
              <Loading backgroundColor="transparent" />
            ) : (
              <Error message={error} />
            )
          ) : (showDeclined ? declinedUsers : pendingUsers).length === 0 ? (
            <p>{showDeclined ? "No declined users." : "No pending users."}</p>
          ) : (
            <table className="admin-table">
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
                        <h6 className={`role-badge ${user.role || "unknown"}`}>
                          {user.role
                            ? user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)
                            : "Unknown"}
                        </h6>
                      </td>
                      <td className="unresponsive">
                        <p>{user.fullName}</p>
                      </td>
                      <td>
                        <p>{user.email}</p>
                      </td>
                      <td className="unresponsive">
                        <p>{user.id}</p>
                      </td>
                      <td>
                        <button
                          onClick={() => updateUserRole(user.email, "user")}
                        >
                          Approve
                        </button>
                        {!showDeclined && (
                          <button
                            className="revoke-btn"
                            onClick={() =>
                              updateUserRole(user.email, "declined")
                            }
                          >
                            Decline
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="panel-container">
        <h5>List of Users</h5>
        <div className="table-wrapper">
          {loading || error ? (
            loading ? (
              <Loading backgroundColor="transparent" />
            ) : (
              <Error message={error} />
            )
          ) : (
            <table className="admin-table">
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
                {approvedUsers.map((user, i) => {
                  const newRole = user.role === "admin" ? "user" : "admin";
                  return (
                    <tr key={user.id}>
                      <td style={{ textAlign: "center" }}>{i + 1}</td>
                      <td>
                        <h6 className={`role-badge ${user.role}`}>
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </h6>
                      </td>
                      <td className="unresponsive">
                        <p>{user.fullName}</p>
                      </td>
                      <td>
                        <p>{user.email}</p>
                      </td>
                      <td className="unresponsive">
                        <p>{user.id}</p>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            onClick={() => updateUserRole(user.email, newRole)}
                            className="role-toggle-btn"
                          >
                            Set as {newRole}
                          </button>
                          <button
                            className="revoke-btn"
                            onClick={() =>
                              updateUserRole(user.email, "waiting approval")
                            }
                          >
                            Revoke access
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
