import AppPanel from "../../../../../shared/components/AppPanel/AppPanel.jsx";
import Icon from "../../../../../shared/components/Icon/Icon.jsx";

import { MoonIcon, SunIcon, SystemIcon } from "./ThemeIcons.jsx";

const ThemeSettingsSection = ({ themeMode, setThemeMode }) => {
  return (
    <section className="settings-page__section">
      <h2>Застосунок</h2>

      <AppPanel className="settings-page__card settings-page__theme-card">
        <div className="settings-page__theme-header">
          <span className="settings-page__row-icon">
            <Icon name="moon" />
          </span>

          <div className="settings-page__row-content">
            <span className="settings-page__row-title">Тема</span>

            <span className="settings-page__row-value">
              {themeMode === "system"
                ? "Системна"
                : themeMode === "light"
                  ? "Світла"
                  : "Темна"}
            </span>
          </div>
        </div>

        <div className="settings-page__theme-options">
          <button
            type="button"
            className={`settings-page__theme-option ${
              themeMode === "system"
                ? "settings-page__theme-option--active"
                : ""
            }`}
            onClick={() => setThemeMode("system")}
          >
            <SystemIcon />

            <span>Системна</span>
          </button>

          <button
            type="button"
            className={`settings-page__theme-option ${
              themeMode === "light" ? "settings-page__theme-option--active" : ""
            }`}
            onClick={() => setThemeMode("light")}
          >
            <SunIcon />

            <span>Світла</span>
          </button>

          <button
            type="button"
            className={`settings-page__theme-option ${
              themeMode === "dark" ? "settings-page__theme-option--active" : ""
            }`}
            onClick={() => setThemeMode("dark")}
          >
            <MoonIcon />

            <span>Темна</span>
          </button>
        </div>
      </AppPanel>
    </section>
  );
};

export default ThemeSettingsSection;
