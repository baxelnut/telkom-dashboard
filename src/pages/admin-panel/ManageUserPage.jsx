import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// Style
import "./ManageUserPage.css";
// Components
import Button from "../../components/ui/buttons/Button";
import Dropdown from "../../components/ui/input/Dropdown";
import InputField from "../../components/ui/input/InputField";
import Loading from "../../components/ui/states/Loading";
// Data
import { SVG_PATHS } from "../../data/utilsData";
import { ROLE_OPT } from "../../data/manageUserData";

export default function ManageUserPage({ API_URL }) {
  const { uid } = useParams();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/user-info/by-uid?uid=${uid}`);
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setUser(data.data);
        setForm(data.data);
      } catch (err) {
        console.error("Fetch user error:", err);
      }
    };
    fetchUser();
  }, [uid, API_URL]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/user-info/update/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update user");
      setUser((prev) => ({ ...prev, ...form }));
      setEditMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <div className="page admin manage">
        <Loading backgroundColor="transparent" />
      </div>
    );

  return (
    <div className="page admin manage">
      <h4>Manage User</h4>

      <div className="user-details">
        <InputField
          name="fullName"
          type="text"
          label="Name"
          value={form.fullName || ""}
          onChange={handleChange}
          fullWidth
          disabled={!editMode}
        />
        <InputField
          name="email"
          type="text"
          label="Email"
          value={form.email || ""}
          onChange={handleChange}
          fullWidth
          disabled={!editMode}
        />
        <InputField
          name="teleUsername"
          type="text"
          label="Telegram"
          value={form.teleUsername || ""}
          onChange={handleChange}
          fullWidth
          disabled={!editMode}
          isUsername
        />

        <div className="details-footer-container">
          <Dropdown
            name="role"
            options={ROLE_OPT}
            value={form.role || ""}
            onChange={handleChange}
            chevronDown
            short
            disabled={!editMode}
          />
          <div className="edit-btn-container">
            {editMode && (
              <Button
                text="Cancel"
                onClick={() => setEditMode(false)}
                backgroundColor="grey"
                short
                disabled={loading}
              />
            )}
            <Button
              text={editMode ? (loading ? "Saving..." : "Save") : "Edit"}
              iconPath={!editMode ? SVG_PATHS.vectorPen : undefined}
              onClick={editMode ? handleSave : () => setEditMode(true)}
              disabled={editMode && loading}
              short
            />
          </div>
        </div>
      </div>
    </div>
  );
}
