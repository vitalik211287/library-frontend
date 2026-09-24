import { NavLink } from "react-router-dom";

import "./AdminNavigation.css";

const AdminNavigation = () => {
  return (
    <nav className="admin-navigation" aria-label="Навігація адміністрування">
      <NavLink
        to="/admin/users"
        className={({ isActive }) =>
          `admin-navigation__link ${
            isActive ? "admin-navigation__link--active" : ""
          }`
        }
      >
        Користувачі
      </NavLink>

      <NavLink
        to="/admin/settings"
        className={({ isActive }) =>
          `admin-navigation__link ${
            isActive ? "admin-navigation__link--active" : ""
          }`
        }
      >
        Оформлення
      </NavLink>
    </nav>
  );
};

export default AdminNavigation;
