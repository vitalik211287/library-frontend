import Modal from "../../../../../shared/components/Modal/Modal.jsx";

const ChangeNameModal = ({
  isOpen,
  name,
  setName,
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
        <h2>Змінити ім&apos;я</h2>

        <label className="settings-page__field">
          <span>Ім&apos;я</span>

          <input
            type="text"
            value={name}
            maxLength={50}
            autoFocus
            onChange={(event) =>
              setName(event.target.value)
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
              : "Зберегти"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangeNameModal;
