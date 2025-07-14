import { Helmet } from "react-helmet-async";
// Style
import "./AdminPanelPage.css";
// Components
import Dropdown from "../../components/ui/input/Dropdown";

export default function AdminPanelPage({ API_URL }) {
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
        <h6>Pending Approval / Declined Accounts</h6>
      </div>

      <div className="card admin list">
        <h6>List of Users</h6>
      </div>
    </div>
  );
}
