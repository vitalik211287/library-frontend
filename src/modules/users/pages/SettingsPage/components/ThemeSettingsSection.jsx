import AppPanel from "../../../../../shared/components/AppPanel/AppPanel.jsx";
import Icon from "../../../../../shared/components/Icon/Icon.jsx";

import { THEME_OPTIONS } from "../../../../../shared/theme/themes.js";


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
              {THEME_OPTIONS.find((theme) => theme.id === themeMode)?.label}
            </span>
          </div>
        </div>

        <div className="settings-page__theme-options">
          {THEME_OPTIONS.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`settings-page__theme-option ${
                themeMode === theme.id
                  ? "settings-page__theme-option--active"
                  : ""
              }`}
              onClick={() => setThemeMode(theme.id)}
            >
              <Icon name={theme.icon} />

              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      </AppPanel>
    </section>
  );
};

export default ThemeSettingsSection;
