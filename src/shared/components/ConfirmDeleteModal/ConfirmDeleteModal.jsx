import Modal from "../Modal/Modal.jsx";

import "./ConfirmDeleteModal.css";

const ConfirmDeleteModal = ({
  isOpen,
  title,
  description,
  confirmText = "Видалити",
  cancelText = "Скасувати",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const handleClose = () => {
    if (isLoading) {
      return;
    }

    onCancel();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="confirm-delete-modal"
      closeOnEscape={!isLoading}
      closeOnBackdrop={!isLoading}
      showHeader={false}
    >
      <div className="confirm-delete-modal__content">
        <div className="confirm-delete-modal__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 10v6" />
            <path d="M14 10v6" />
          </svg>
        </div>

        <h3>{title}</h3>

        <p>{description}</p>

        <div className="confirm-delete-modal__actions">
          <button type="button" onClick={handleClose} disabled={isLoading}>
            {cancelText}
          </button>

          <button
            type="button"
            className="confirm-delete-modal__confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Видалення..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;

