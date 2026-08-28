import { useNavigate } from "react-router-dom";

import "./SettingsPage.css";

import { useAuth } from "../../context/AuthContext.jsx";

function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleBack = () => {
    navigate("/account");
  };

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <main className="settings-page">
      <section className="settings-page__content">
        <header className="settings-page__header">
          <button
            type="button"
            className="settings-page__back"
            onClick={handleBack}
            aria-label="Назад"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <h1>Налаштування</h1>
        </header>

        <section className="settings-page__section">
          <h2>Профіль</h2>

          <div className="settings-page__card">
            <button
              type="button"
              className="settings-page__row"
            >
              <span className="settings-page__row-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </span>

              <span className="settings-page__row-content">
                <span className="settings-page__row-title">
                  Ім'я
                </span>

                <span className="settings-page__row-value">
                  {user?.name || "Не вказано"}
                </span>
              </span>

              <span className="settings-page__chevron">
                ›
              </span>
            </button>

            <button
              type="button"
              className="settings-page__row"
            >
              <span className="settings-page__row-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>

              <span className="settings-page__row-content">
                <span className="settings-page__row-title">
                  Email
                </span>

                <span className="settings-page__row-value">
                  {user?.email || "Не вказано"}
                </span>
              </span>

              <span className="settings-page__chevron">
                ›
              </span>
            </button>

            <button
              type="button"
              className="settings-page__row"
            >
              <span className="settings-page__row-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="16"
                    rx="2"
                  />
                  <circle
                    cx="9"
                    cy="9"
                    r="2"
                  />
                  <path d="m21 15-5-5L5 20" />
                </svg>
              </span>

              <span className="settings-page__row-content">
                <span className="settings-page__row-title">
                  Аватар
                </span>
              </span>

              <span className="settings-page__chevron">
                ›
              </span>
            </button>
          </div>
        </section>

        <section className="settings-page__section">
          <h2>Акаунт</h2>

          <div className="settings-page__card">
            <button
              type="button"
              className="settings-page__row"
            >
              <span className="settings-page__row-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="11"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>

              <span className="settings-page__row-content">
                <span className="settings-page__row-title">
                  Змінити пароль
                </span>
              </span>

              <span className="settings-page__chevron">
                ›
              </span>
            </button>
          </div>
        </section>

        <section className="settings-page__section">
          <h2>Застосунок</h2>

          <div className="settings-page__card">
            <div className="settings-page__row">
              <span className="settings-page__row-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" />
                </svg>
              </span>

              <span className="settings-page__row-content">
                <span className="settings-page__row-title">
                  Тема
                </span>
              </span>

              <span className="settings-page__row-value">
                Поточна
              </span>
            </div>
          </div>
        </section>

        <button
          type="button"
          className="settings-page__logout"
          onClick={handleLogout}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
          </svg>

          Вийти з акаунта
        </button>
      </section>
    </main>
  );
}

export default SettingsPage;