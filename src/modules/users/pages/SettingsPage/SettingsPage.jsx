import { useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../../auth/context/AuthContext.jsx";

import { useTheme } from "../../../../shared/context/ThemeContext.jsx";

import { apiFetch } from "../../../../shared/api/apiClient.js";

import ChangeNameModal from "./components/ChangeNameModal.jsx";
import ChangePasswordModal from "./components/ChangePasswordModal.jsx";
import ThemeSettingsSection from "./components/ThemeSettingsSection.jsx";
import LogoutModal from "./components/LogoutModal/LogoutModal.jsx";

import AppPanel from "../../../../shared/components/AppPanel/AppPanel.jsx";
import Icon from "../../../../shared/components/Icon/Icon.jsx";

import "./SettingsPage.css";

const SettingsPage = () => {
  const navigate = useNavigate();

  const { user, logout, updateUser } = useAuth();

  const { themeMode, setThemeMode } = useTheme();

  const fileInputRef = useRef(null);

  const [isNameOpen, setIsNameOpen] = useState(false);

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

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
    setIsLogoutOpen(false);

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
            <Icon name="chevron-left" />
          </button>

          <h1>Налаштування</h1>
        </header>

        <section className="settings-page__section">
          <h2>Профіль</h2>

          <AppPanel className="settings-page__card">
            <button
              type="button"
              className="settings-page__row"
              onClick={handleOpenName}
            >
              <span className="settings-page__row-icon">
                <Icon name="profile" />
              </span>

              <span className="settings-page__row-content">
                <span className="settings-page__row-title">Ім&apos;я</span>

                <span className="settings-page__row-value">
                  {user?.name || "Не вказано"}
                </span>
              </span>

              <span className="settings-page__chevron">
                <Icon name="chevron-right" />
              </span>
            </button>

            <div className="settings-page__row">
              <span className="settings-page__row-icon">
                <Icon name="email" />
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
                  <img src={user.avatarUrl} alt="Аватар користувача" decoding="async" />
                ) : (
                  <Icon name="profile" />
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

              <span className="settings-page__chevron">
                <Icon name="chevron-right" />
              </span>
            </button>

            <input
              ref={fileInputRef}
              className="settings-page__file-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </AppPanel>
        </section>

        <section className="settings-page__section">
          <h2>Акаунт</h2>

          <AppPanel className="settings-page__card">
            <button
              type="button"
              className="settings-page__row"
              onClick={handleOpenPassword}
            >
              <span className="settings-page__row-icon">
                <Icon name="lock" />
              </span>

              <span className="settings-page__row-content">
                <span className="settings-page__row-title">Змінити пароль</span>
              </span>

              <span className="settings-page__chevron">
                <Icon name="chevron-right" />
              </span>
            </button>
          </AppPanel>
        </section>

        <ThemeSettingsSection
          themeMode={themeMode}
          setThemeMode={setThemeMode}
        />

        <button
          type="button"
          className="settings-page__logout"
          onClick={() => setIsLogoutOpen(true)}
        >
          <Icon name="logout" />
          Вийти з акаунта
        </button>
      </section>

      <LogoutModal
          isOpen={isLogoutOpen}
          onCancel={() => setIsLogoutOpen(false)}
          onConfirm={handleLogout}
        />



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
