import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import "./Modal.css";
import useOverlayBack from "../../hooks/useOverlayBack.js";

let openModalCount = 0;

let originalBodyOverflow = "";
let originalBodyPaddingRight = "";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

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
  ariaLabel,
}) => {
  const modalRef = useRef(null);
  const titleId = useId();

  useOverlayBack(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previouslyFocusedElement = document.activeElement;

    lockBodyScroll();

    const modalElement = modalRef.current;
    const focusableElements = modalElement
      ? Array.from(modalElement.querySelectorAll(focusableSelector))
      : [];

    const firstFocusableElement = focusableElements[0];

    if (firstFocusableElement) {
      firstFocusableElement.focus();
    } else {
      modalElement?.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalElement) {
        return;
      }

      const currentFocusableElements = Array.from(
        modalElement.querySelectorAll(focusableSelector),
      );

      if (currentFocusableElements.length === 0) {
        event.preventDefault();
        modalElement.focus();
        return;
      }

      const firstElement = currentFocusableElements[0];
      const lastElement =
        currentFocusableElements[currentFocusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unlockBodyScroll();

      window.removeEventListener("keydown", handleKeyDown);

      if (
        previouslyFocusedElement instanceof HTMLElement &&
        document.contains(previouslyFocusedElement)
      ) {
        previouslyFocusedElement.focus();
      }
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
        ref={modalRef}
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={showHeader && title ? titleId : undefined}
        aria-label={!showHeader ? ariaLabel : undefined}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {showHeader && (
          <div className="modal__header">
            <div className="modal__heading">
              {eyebrow && <span className="modal__eyebrow">{eyebrow}</span>}

              {title && (
                <h2 id={titleId} className="modal__title">
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
