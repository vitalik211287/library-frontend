import { useEffect } from "react";
import { createPortal } from "react-dom";

import "./Modal.css";

let openModalCount = 0;

let originalBodyOverflow = "";
let originalBodyPaddingRight = "";

const lockBodyScroll = () => {
  if (openModalCount === 0) {
    originalBodyOverflow = document.body.style.overflow;

    originalBodyPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  openModalCount += 1;
};

const unlockBodyScroll = () => {
  openModalCount = Math.max(openModalCount - 1, 0);

  if (openModalCount > 0) {
    return;
  }

  document.body.style.overflow = originalBodyOverflow;

  document.body.style.paddingRight = originalBodyPaddingRight;
};

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

    lockBodyScroll();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unlockBodyScroll();

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
