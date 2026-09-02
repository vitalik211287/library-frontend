import { useEffect } from "react";
import { createPortal } from "react-dom";

import "./Modal.css";

const Modal = ({
  isOpen,
  onClose,
  title,
  eyebrow,
  subtitle,
  children,
  className = "",
  closeOnEscape = true,
  closeOnBackdrop = true,
  showHeader = true,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.body.style.paddingRight = previousPaddingRight;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropMouseDown = (event) => {
    if (!closeOnBackdrop || event.target !== event.currentTarget) {
      return;
    }

    onClose();
  };

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={handleBackdropMouseDown}
      role="presentation"
    >
      <section
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {showHeader && (
          <div className="modal__header">
            <div className="modal__heading">
              {eyebrow && <span className="modal__eyebrow">{eyebrow}</span>}

              {title && (
                <h2 id="modal-title" className="modal__title">
                  {title}
                </h2>
              )}

              {subtitle && <p className="modal__subtitle">{subtitle}</p>}
            </div>

            <button
              type="button"
              className="modal__close"
              onClick={onClose}
              aria-label="Закрити"
            >
              ×
            </button>
          </div>
        )}

        <div className="modal__content">{children}</div>
      </section>
    </div>,
    document.body,
  );
};

export default Modal;
