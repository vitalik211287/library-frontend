import { getStatusLabel } from "../../utils/catalogHelpers.js";

import "./BookCard.css";

const BookCard = ({
  book,
  isAuthenticated,
  isAuthLoading,
  wishlistLoadingId,
  canEdit,
  showWishlist = true,
  onWishlistToggle,
  onEdit,
  onRead,
}) => {
  return (
    <article className="book-card">
      {isAuthenticated && showWishlist && (
        <button
          type="button"
          className={`book-card__wishlist ${
            book.isWishlist ? "book-card__wishlist--active" : ""
          }`}
          onClick={() => onWishlistToggle(book)}
          disabled={wishlistLoadingId === book.id}
          aria-label={
            book.isWishlist
              ? "Прибрати з хочу прочитати"
              : "Додати до хочу прочитати"
          }
          title={
            book.isWishlist ? "Прибрати з «Хочу прочитати»" : "Хочу прочитати"
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />
          </svg>
        </button>
      )}

      {book.coverUrl && (
        <img className="book-cover" src={book.coverUrl} alt={book.title} />
      )}

      <div className="book-card__content">
        <h2>{book.title}</h2>

        <p className="book-card__author">{book.author}</p>

        {isAuthenticated && (
          <div className="book-card__reading-info">
            <p>
              Статус: <strong>{getStatusLabel(book.status)}</strong>
            </p>

            <div className="book-card__rating-row">
              <span>Рейтинг:</span>

              <div
                className="book-card__stars"
                aria-label={`Рейтинг ${book.rating ?? 0} з 5`}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <span key={value} className="book-card__star">
                    {value <= (book.rating ?? 0) ? "★" : "☆"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="book-card__extra-info">
          {book.publisher && <p>Видавництво: {book.publisher}</p>}

          {book.year && <p>Рік: {book.year}</p>}

          {book.genre && <p>Жанр: {book.genre}</p>}
        </div>
      </div>

      <div className="book-card__actions">
        {canEdit && (
          <button
            type="button"
            className="book-card__button book-card__button--edit"
            onClick={() => onEdit(book)}
          >
            Редагувати
          </button>
        )}

        <button
          type="button"
          className="book-card__button book-card__button--read"
          onClick={() => onRead(book)}
          disabled={isAuthLoading}
        >
          Читати
        </button>
      </div>
    </article>
  );
};

export default BookCard;

