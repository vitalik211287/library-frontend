import { useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext.jsx";

import { useTheme } from "../../context/ThemeContext.jsx";

import { apiFetch } from "../../utils/apiClient.js";

import "./SettingsPage.css";

const SystemIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="2" />

      <path d="M8 21h8" />
      <path d="M12 18v3" />
    </svg>
  );
};

const SunIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />

      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
};

const MoonIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </svg>
  );
};

const SettingsPage = () => {
  const navigate = useNavigate();

  const { user, logout, updateUser } = useAuth();

  const { themeMode, setThemeMode } = useTheme();

  const fileInputRef = useRef(null);

  const [isNameOpen, setIsNameOpen] = useState(false);

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const [name, setName] = useState(user?.name ?? "");

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSavingName, setIsSavingName] = useState(false);

  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  /* =========================
     НАВІГАЦІЯ
  ========================= */

  const handleBack = () => {
    navigate("/account");
  };

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  /* =========================
     ІМ'Я
  ========================= */

  const handleOpenName = () => {
    setName(user?.name ?? "");

    setIsNameOpen(true);
  };

  const handleCloseName = () => {
    if (isSavingName) {
      return;
    }

    setIsNameOpen(false);
  };

  const handleSaveName = async (event) => {
    event.preventDefault();

    const normalizedName = name.trim();

    if (normalizedName.length < 2) {
      toast.error("Ім’я має містити щонайменше 2 символи");

      return;
    }

    try {
      setIsSavingName(true);

      const data = await apiFetch("/api/auth/me/name", {
        method: "PATCH",
        body: {
          name: normalizedName,
        },
      });

      updateUser(data.user);

      setIsNameOpen(false);

      toast.success("Ім’я змінено");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не вдалося змінити ім’я",
      );
    } finally {
      setIsSavingName(false);
    }
  };

  /* =========================
     ПАРОЛЬ
  ========================= */

  const handleOpenPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setIsPasswordOpen(true);
  };

  const handleClosePassword = () => {
    if (isSavingPassword) {
      return;
    }

    setIsPasswordOpen(false);
  };

  const handleSavePassword = async (event) => {
    event.preventDefault();

    if (!currentPassword) {
      toast.error("Введи поточний пароль");

      return;
    }

    if (newPassword.length < 6) {
      toast.error("Новий пароль має містити мінімум 6 символів");

      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Нові паролі не збігаються");

      return;
    }

    try {
      setIsSavingPassword(true);

      await apiFetch("/api/auth/me/password", {
        method: "PATCH",
        body: {
          currentPassword,
          newPassword,
        },
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setIsPasswordOpen(false);

      toast.success("Пароль змінено");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не вдалося змінити пароль",
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  /* =========================
     АВАТАР
  ========================= */

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Оберіть зображення");

      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Максимальний розмір фото — 5 МБ");

      return;
    }

    try {
      setIsUploadingAvatar(true);

      const formData = new FormData();

      formData.append("avatar", file);

      const data = await apiFetch("/api/auth/me/avatar", {
        method: "PATCH",
        body: formData,
      });

      updateUser(data.user);

      toast.success("Аватар оновлено");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити аватар",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
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
            <svg viewBox="0 0 24 24" aria-hidden="true">
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
              onClick={handleOpenName}
            >
              <span className="settings-page__row-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />

                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </span>

              <span className="settings-page__row-content">
                <span className="settings-page__row-title">Ім&apos;я</span>

                <span className="settings-page__row-value">
                  {user?.name || "Не вказано"}
                </span>
              </span>

              <span className="settings-page__chevron">›</span>
            </button>

            <div className="settings-page__row">
              <span className="settings-page__row-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />

                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>

              <span className="settings-page__row-content">
                <span className="settings-page__row-title">Email</span>

                <span className="settings-page__row-value">
                  {user?.email || "Не вказано"}
                </span>
              </span>
            </div>

            <button
              type="button"
              className="settings-page__row"
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
            >
              <span className="settings-page__avatar">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Аватар користувача" />
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />

                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                )}
              </span>

              <span className="settings-page__row-content">
                <span className="settings-page__row-title">Аватар</span>

                <span className="settings-page__row-value">
                  {isUploadingAvatar
                    ? "Завантаження..."
                    : user?.avatarUrl
                      ? "Змінити фото"
                      : "Додати фото"}
                </span>
              </span>

              <span className="settings-page__chevron">›</span>
            </button>

            <input
              ref={fileInputRef}
              className="settings-page__file-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
        </section>

        <section className="settings-page__section">
          <h2>Акаунт</h2>

          <div className="settings-page__card">
            <button
              type="button"
              className="settings-page__row"
              onClick={handleOpenPassword}
            >
              <span className="settings-page__row-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="11" rx="2" />

                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>

              <span className="settings-page__row-content">
                <span className="settings-page__row-title">Змінити пароль</span>
              </span>

              <span className="settings-page__chevron">›</span>
            </button>
          </div>
        </section>

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
                  themeMode === "light"
                    ? "settings-page__theme-option--active"
                    : ""
                }`}
                onClick={() => setThemeMode("light")}
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
                onClick={() => setThemeMode("dark")}
              >
                <MoonIcon />

                <span>Темна</span>
              </button>
            </div>
          </div>
        </section>

        <button
          type="button"
          className="settings-page__logout"
          onClick={handleLogout}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
          </svg>
          Вийти з акаунта
        </button>
      </section>

      {isNameOpen && (
        <div
          className="settings-page__modal-overlay"
          onMouseDown={handleCloseName}
        >
          <form
            className="settings-page__modal"
            onSubmit={handleSaveName}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2>Змінити ім&apos;я</h2>

            <label className="settings-page__field">
              <span>Ім&apos;я</span>

              <input
                type="text"
                value={name}
                maxLength={50}
                autoFocus
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <div className="settings-page__modal-actions">
              <button
                type="button"
                className="settings-page__modal-button settings-page__modal-button--secondary"
                onClick={handleCloseName}
                disabled={isSavingName}
              >
                Скасувати
              </button>

              <button
                type="submit"
                className="settings-page__modal-button settings-page__modal-button--primary"
                disabled={isSavingName}
              >
                {isSavingName ? "Збереження..." : "Зберегти"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isPasswordOpen && (
        <div
          className="settings-page__modal-overlay"
          onMouseDown={handleClosePassword}
        >
          <form
            className="settings-page__modal"
            onSubmit={handleSavePassword}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2>Змінити пароль</h2>

            <label className="settings-page__field">
              <span>Поточний пароль</span>

              <input
                type="password"
                value={currentPassword}
                autoComplete="current-password"
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>

            <label className="settings-page__field">
              <span>Новий пароль</span>

              <input
                type="password"
                value={newPassword}
                autoComplete="new-password"
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>

            <label className="settings-page__field">
              <span>Повтори новий пароль</span>

              <input
                type="password"
                value={confirmPassword}
                autoComplete="new-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>

            <div className="settings-page__modal-actions">
              <button
                type="button"
                className="settings-page__modal-button settings-page__modal-button--secondary"
                onClick={handleClosePassword}
                disabled={isSavingPassword}
              >
                Скасувати
              </button>

              <button
                type="submit"
                className="settings-page__modal-button settings-page__modal-button--primary"
                disabled={isSavingPassword}
              >
                {isSavingPassword ? "Збереження..." : "Змінити пароль"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default SettingsPage;
