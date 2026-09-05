import Modal from "../../../../shared/components/Modal/Modal.jsx";

const AddLibraryMemberModal = ({
  isOpen,
  activeLibrary,
  memberEmail,
  setMemberEmail,
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

    setMemberEmail("");
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title="Додати учасника"
      subtitle={
        activeLibrary?.name
          ? `Бібліотека «${activeLibrary.name}»`
          : "Додайте користувача до бібліотеки"
      }
      className="library-action-modal"
      closeOnEscape={!isSubmitting}
      closeOnBackdrop={!isSubmitting}
    >
      <form
        className="library-action-modal__form"
        onSubmit={onSubmit}
      >
        <label className="library-action-modal__field">
          <span>Email користувача</span>

          <input
            type="email"
            value={memberEmail}
            onChange={(event) =>
              setMemberEmail(event.target.value)
            }
            placeholder="user@example.com"
            autoComplete="email"
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
              !memberEmail.trim()
            }
          >
            {isSubmitting
              ? "Додавання..."
              : "Додати"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLibraryMemberModal;
