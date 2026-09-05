import { NavLink } from "react-router-dom";

import { mainNavigationItems } from "./navigationItems.js";

import {
  CatalogIcon,
  MoonIcon,
  ProfileIcon,
  SettingsIcon,
  SunIcon,
  SystemIcon,
  navigationIcons,
} from "./NavigationIcons.jsx";

const DesktopNavigation = ({
  isAuthenticated,
  isAuthLoading,
  onOpenReader,
  themeMode,
  onThemeChange,
}) => {
  const accountPath = isAuthenticated ? "/account" : "/login";

  return (
    <aside className="app-sidebar">
      <NavLink to="/home" className="app-brand">
        <CatalogIcon />

        <span>Бібліотека</span>
      </NavLink>

      <nav className="desktop-nav">
        {mainNavigationItems.map((item) => {
          const Icon = navigationIcons[item.key];

          if (item.action === "reader") {
            return (
              <button
                key={item.key}
                type="button"
                className="desktop-nav__link"
                onClick={onOpenReader}
              >
                <Icon />

                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <NavLink key={item.key} to={item.to} className="desktop-nav__link">
              <Icon />

              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <NavLink
          to={accountPath}
          className={`desktop-nav__link ${
            isAuthLoading ? "desktop-nav__link--loading" : ""
          }`}
        >
          <ProfileIcon />

          <span>{isAuthenticated ? "Мій профіль" : "Увійти"}</span>
        </NavLink>

        <NavLink to="/settings" className="desktop-nav__link">
          <SettingsIcon />

          <span>Налаштування</span>
        </NavLink>
      </nav>

      {/* =========================
          DESKTOP THEME
      ========================= */}

      <div className="desktop-theme">
        <span className="desktop-theme__title">Тема</span>

        <div className="desktop-theme__options">
          <button
            type="button"
            className={themeMode === "system" ? "active" : ""}
            onClick={() => onThemeChange("system")}
            title="Системна тема"
          >
            <SystemIcon />
          </button>

          <button
            type="button"
            className={themeMode === "light" ? "active" : ""}
            onClick={() => onThemeChange("light")}
            title="Світла тема"
          >
            <SunIcon />
          </button>

          <button
            type="button"
            className={themeMode === "dark" ? "active" : ""}
            onClick={() => onThemeChange("dark")}
            title="Темна тема"
          >
            <MoonIcon />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopNavigation;

