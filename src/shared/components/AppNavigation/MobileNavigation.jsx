import "./AppNavigation.css";

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

const MobileNavigation = ({
  user,
  isAuthenticated,
  isAuthLoading,
  isOpen,
  onOpen,
  onClose,
  onOpenReader,
  themeMode,
  onThemeChange,
}) => {
  const accountPath = isAuthenticated ? "/account" : "/login";

  const handleMenuButtonClick = () => {
    if (isOpen) {
      onClose();

      return;
    }

    onOpen();
  };

  return (
    <>
      {/* =========================
          MOBILE HEADER
      ========================= */}

      <header className="mobile-header">
        <NavLink to="/home" className="mobile-header__brand">
          <CatalogIcon />

          <span>Бібліотека</span>
        </NavLink>

        <div className="mobile-header__actions">
          {isAuthenticated && (
            <NavLink
              to="/account"
              className="mobile-header__avatar"
              aria-label="Відкрити профіль"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name || "Профіль"} />
              ) : (
                <span>{(user?.name || "К").charAt(0).toUpperCase()}</span>
              )}
            </NavLink>
          )}

          <button
            type="button"
            className={`mobile-menu-button ${
              isOpen ? "mobile-menu-button--open" : ""
            }`}
            onClick={handleMenuButtonClick}
            aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}
            aria-expanded={isOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* =========================
          MOBILE OVERLAY
      ========================= */}

      <div
        className={`mobile-menu-overlay ${
          isOpen ? "mobile-menu-overlay--open" : ""
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* =========================
          MOBILE DRAWER
      ========================= */}

      {isOpen && (
        <aside className="mobile-drawer mobile-drawer--open">
          <div className="mobile-drawer__header">
            <div className="mobile-drawer__brand">
              <CatalogIcon />

              <span>Бібліотека</span>
            </div>

            <button
              type="button"
              className="mobile-drawer__close"
              onClick={onClose}
              aria-label="Закрити меню"
            >
              ×
            </button>
          </div>

          <nav className="mobile-drawer__nav">
            {mainNavigationItems.map((item) => {
              const Icon = navigationIcons[item.key];

              if (item.action === "reader") {
                return (
                  <button
                    key={item.key}
                    type="button"
                    className="mobile-drawer__link"
                    onClick={onOpenReader}
                  >
                    <Icon />

                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  className="mobile-drawer__link"
                  onClick={onClose}
                >
                  <Icon />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <NavLink
              to={accountPath}
              className={`mobile-drawer__link ${
                isAuthLoading ? "mobile-drawer__link--loading" : ""
              }`}
              onClick={onClose}
            >
              <ProfileIcon />

              <span>{isAuthenticated ? "Профіль" : "Увійти"}</span>
            </NavLink>
          </nav>

          <div className="mobile-drawer__settings">
            <NavLink
              to="/settings"
              className="mobile-drawer__link mobile-drawer__settings-link"
              onClick={onClose}
            >
              <SettingsIcon />

              <span>Налаштування</span>
            </NavLink>
          </div>

          {/* =========================
              MOBILE THEME
          ========================= */}

          <div className="mobile-theme">
            <span className="mobile-theme__title">Тема</span>

            <div className="mobile-theme__options">
              <button
                type="button"
                className={`mobile-theme__option ${
                  themeMode === "system" ? "mobile-theme__option--active" : ""
                }`}
                onClick={() => onThemeChange("system")}
              >
                <SystemIcon />

                <span>Системна</span>
              </button>

              <button
                type="button"
                className={`mobile-theme__option ${
                  themeMode === "light" ? "mobile-theme__option--active" : ""
                }`}
                onClick={() => onThemeChange("light")}
              >
                <SunIcon />

                <span>Світла</span>
              </button>

              <button
                type="button"
                className={`mobile-theme__option ${
                  themeMode === "dark" ? "mobile-theme__option--active" : ""
                }`}
                onClick={() => onThemeChange("dark")}
              >
                <MoonIcon />

                <span>Темна</span>
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};

export default MobileNavigation;

