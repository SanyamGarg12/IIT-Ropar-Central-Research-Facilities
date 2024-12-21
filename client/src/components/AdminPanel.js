import React from "react";
import { Link } from "react-router-dom";
import "./AdminPanel.css";

const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <ul className="admin-links">
        <li>
          <Link to="/admin/members">Manage Members</Link>
        </li>
        <li>
          <Link to="/admin/facilities">Manage Facilities</Link>
        </li>
        <li>
          <Link to="/admin/forms">Manage Forms</Link>
        </li>
        <li>
          <Link to="/admin/publications">Manage Publications</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminPanel;
