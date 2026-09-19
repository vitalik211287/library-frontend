import "./SocialBookModal.css";

const SocialBookModal = ({ book, onClose, onOpenCatalog }) => {
  if (!book) {
    return null;
  }

  return (
    <div
      className="social-book-modal__backdrop"
      data-swipe-ignore
      role="presentation"
      onClick={onClose}
    >
      <div
        className="social-book-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Книга ${book.title || ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="social-book-modal__handle" />

        <button
          type="button"
          className="social-book-modal__close"
          onClick={onClose}
          aria-label="Закрити"
        >
          ×
        </button>

        <div className="social-book-modal__content">
          <div className="social-book-modal__cover">
            {book.coverUrl ? (
              <img
                loading="lazy"
                decoding="async"
                src={book.coverUrl}
                alt={book.title || "Книга"}
              />
            ) : (
              <span>📚</span>
            )}
          </div>

          <div className="social-book-modal__info">
            <span className="social-book-modal__label">КНИГА</span>

            <h2>{book.title || "Книга"}</h2>

            <p>{book.author || "Автор не вказаний"}</p>

            {book.pages && (
              <span className="social-book-modal__meta">
                {book.pages} стор.
              </span>
            )}
          </div>
        </div>

        <div className="social-book-modal__actions">
          <button
            type="button"
            className="social-book-modal__catalog"
            onClick={() => onOpenCatalog?.(book)}
          >
            Відкрити в каталозі
          </button>

          <button
            type="button"
            className="social-book-modal__cancel"
            onClick={onClose}
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialBookModal;
