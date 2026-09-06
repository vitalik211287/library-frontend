import Modal from "../../../../../shared/components/Modal/Modal.jsx";

const ChangePasswordModal = ({
  isOpen,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isSaving,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="settings-page__modal"
      showHeader={false}
    >
      <form onSubmit={onSubmit}>
        <h2>Змінити пароль</h2>

        <label className="settings-page__field">
          <span>Поточний пароль</span>

          <input
            type="password"
            value={currentPassword}
            autoComplete="current-password"
            onChange={(event) =>
              setCurrentPassword(event.target.value)
            }
          />
        </label>

        <label className="settings-page__field">
          <span>Новий пароль</span>

          <input
            type="password"
            value={newPassword}
            autoComplete="new-password"
            onChange={(event) =>
              setNewPassword(event.target.value)
            }
          />
        </label>

        <label className="settings-page__field">
          <span>Повтори новий пароль</span>

          <input
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
          />
        </label>

        <div className="settings-page__modal-actions">
          <button
            type="button"
            className="settings-page__modal-button settings-page__modal-button--secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Скасувати
          </button>

          <button
            type="submit"
            className="settings-page__modal-button settings-page__modal-button--primary"
            disabled={isSaving}
          >
            {isSaving
              ? "Збереження..."
              : "Змінити пароль"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
