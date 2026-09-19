import Modal from "../Modal/Modal.jsx";
import Icon from "../Icon/Icon.jsx";

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
          <Icon name="trash" />
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
