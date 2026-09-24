import { useEffect, useState } from "react";

import { getGlobalTheme, updateGlobalTheme } from "../../api/adminApi.js";
import {
  GLOBAL_THEME_MODES,
  GLOBAL_THEME_OPTIONS,
} from "../../../../shared/theme/themes.js";

import { useTheme } from "../../../../shared/context/ThemeContext.jsx";
import AdminNavigation from "../../components/AdminNavigation/AdminNavigation.jsx";

import "./AdminSettingsPage.css";

const AdminSettingsPage = () => {
  const { setGlobalTheme: setAppliedGlobalTheme } = useTheme();
  const [globalTheme, setGlobalTheme] = useState(GLOBAL_THEME_MODES.DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadGlobalTheme = async () => {
      try {
        const theme = await getGlobalTheme();

        if (isActive) {
          setGlobalTheme(theme.toLowerCase());
        }
      } catch {
        if (isActive) {
          setError("Не вдалося завантажити налаштування теми.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadGlobalTheme();

    return () => {
      isActive = false;
    };
  }, []);

  const handleThemeChange = async (theme) => {
    if (theme === globalTheme || isSaving) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const updatedTheme = await updateGlobalTheme(theme.toUpperCase());

      setGlobalTheme(updatedTheme.toLowerCase());
      setAppliedGlobalTheme(updatedTheme.toLowerCase());
    } catch {
      setError("Не вдалося змінити глобальну тему.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="admin-settings">
      <AdminNavigation />
      <header className="admin-settings__header">
        <h1>Адміністрування</h1>
        <p>Глобальні налаштування застосунку.</p>
      </header>

      <section
        className="admin-settings__section"
        aria-labelledby="application-theme-title"
      >
        <div className="admin-settings__section-header">
          <h2 id="application-theme-title">Оформлення застосунку</h2>

          <p>
            Активна глобальна тема перекриває особисту тему всіх користувачів.
          </p>
        </div>

        {isLoading ? (
          <p>Завантаження...</p>
        ) : (
          <div className="admin-settings__theme-options">
            {GLOBAL_THEME_OPTIONS.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={`admin-settings__theme-option ${
                  globalTheme === theme.id
                    ? "admin-settings__theme-option--active"
                    : ""
                }`}
                disabled={isSaving}
                onClick={() => handleThemeChange(theme.id)}
                aria-pressed={globalTheme === theme.id}
              >
                {theme.label}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="admin-settings__error" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
};

export default AdminSettingsPage;
