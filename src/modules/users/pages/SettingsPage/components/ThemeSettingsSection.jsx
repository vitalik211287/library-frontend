import {
  MoonIcon,
  SunIcon,
  SystemIcon,
} from "./ThemeIcons.jsx";

const ThemeSettingsSection = ({
  themeMode,
  setThemeMode,
}) => {
  return (
    <section className="settings-page__section">
      <h2>Застосунок</h2>

      <div className="settings-page__card settings-page__theme-card">
        <div className="settings-page__theme-header">
          <span className="settings-page__row-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" />
            </svg>
          </span>

          <div className="settings-page__row-content">
            <span className="settings-page__row-title">
              Тема
            </span>

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
            onClick={() =>
              setThemeMode("system")
            }
          >
            <SystemIcon />

            <span>Системна</span>
          </button>

          <button
            type="button"
            className={`settings-page__theme-option ${
              themeMode === "light"
                ? "settings-page__theme-option--active"
                : ""
            }`}
            onClick={() =>
              setThemeMode("light")
            }
          >
            <SunIcon />

            <span>Світла</span>
          </button>

          <button
            type="button"
            className={`settings-page__theme-option ${
              themeMode === "dark"
                ? "settings-page__theme-option--active"
                : ""
            }`}
            onClick={() =>
              setThemeMode("dark")
            }
          >
            <MoonIcon />

            <span>Темна</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ThemeSettingsSection;
