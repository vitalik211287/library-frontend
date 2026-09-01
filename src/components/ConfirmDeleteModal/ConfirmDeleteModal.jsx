import { useEffect } from "react";
import { createPortal } from "react-dom";

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
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget && !isLoading) {
      onCancel();
    }
  };

  return createPortal(
    <div
      className="confirm-delete-overlay"
      role="presentation"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        className="confirm-delete-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="confirm-delete-modal__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 10v6" />
            <path d="M14 10v6" />
          </svg>
        </div>

        <h3 id="confirm-delete-title">{title}</h3>

        <p id="confirm-delete-description">{description}</p>

        <div className="confirm-delete-modal__actions">
          <button type="button" onClick={onCancel} disabled={isLoading}>
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
    </div>,
    document.body,
  );
};

export default ConfirmDeleteModal;
