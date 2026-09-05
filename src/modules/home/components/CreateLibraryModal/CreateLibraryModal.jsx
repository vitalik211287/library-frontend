import Modal from "../../../../shared/components/Modal/Modal.jsx";

const CreateLibraryModal = ({
  isOpen,
  libraryName,
  setLibraryName,
  isSubmitting,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setLibraryName("");
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title="Створити бібліотеку"
      subtitle="Створіть нову поличку для книг"
      className="library-action-modal"
      closeOnEscape={!isSubmitting}
      closeOnBackdrop={!isSubmitting}
    >
      <form
        className="library-action-modal__form"
        onSubmit={onSubmit}
      >
        <label className="library-action-modal__field">
          <span>Назва бібліотеки</span>

          <input
            type="text"
            value={libraryName}
            onChange={(event) =>
              setLibraryName(event.target.value)
            }
            placeholder="Наприклад: Домашня бібліотека"
            autoFocus
            required
          />
        </label>

        <div className="library-action-modal__actions">
          <button
            type="button"
            className="library-action-modal__cancel"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Скасувати
          </button>

          <button
            type="submit"
            className="library-action-modal__submit"
            disabled={
              isSubmitting ||
              !libraryName.trim()
            }
          >
            {isSubmitting
              ? "Створення..."
              : "Створити"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateLibraryModal;
