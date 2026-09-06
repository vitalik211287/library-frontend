import { useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../../auth/context/AuthContext.jsx";

import { useTheme } from "../../../../shared/context/ThemeContext.jsx";

import { apiFetch } from "../../../../shared/api/apiClient.js";

import {
  MoonIcon,
  SunIcon,
  SystemIcon,
} from "./components/ThemeIcons.jsx";
import ChangeNameModal from "./components/ChangeNameModal.jsx";
import ChangePasswordModal from "./components/ChangePasswordModal.jsx";
import ThemeSettingsSection from "./components/ThemeSettingsSection.jsx";

import "./SettingsPage.css";

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
      toast.error("Максимальний розмір фото — 15 МБ");

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

        <ThemeSettingsSection
          themeMode={themeMode}
          setThemeMode={setThemeMode}
        />

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

      <ChangeNameModal
        isOpen={isNameOpen}
        name={name}
        setName={setName}
        isSaving={isSavingName}
        onClose={handleCloseName}
        onSubmit={handleSaveName}
      />

      <ChangePasswordModal
        isOpen={isPasswordOpen}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        isSaving={isSavingPassword}
        onClose={handleClosePassword}
        onSubmit={handleSavePassword}
      />

    </main>
  );
};

export default SettingsPage;






