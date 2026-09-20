import { memo } from "react";

import { getStatusLabel } from "../../utils/catalogHelpers.js";

import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";
import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import "./BookCard.css";

const BookCard = ({
  book,
  variant = "default",
  isAuthenticated,
  isAuthLoading,
  wishlistLoadingId,
  canEdit,
  showWishlist = true,
  onWishlistToggle,
  onEdit,
  onRead,
  recommendationMeta,
}) => {
  return (
    <AppPanel
      as="article"
      className={`book-card ${
        variant === "compact" ? "book-card--compact" : ""
      }`}
    >
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
          <Icon name="bookmark" />
        </button>
      )}

      {book.coverUrl && (
        <img
          loading="lazy"
          decoding="async"
          className="book-cover"
          src={book.coverUrl}
          alt={book.title}
        />
      )}

      <div className="book-card__content">
        <h2>{book.title}</h2>

        <p className="book-card__author">{book.author}</p>

        {variant === "compact" && recommendationMeta && (
          <div className="book-card__recommendation">
            <div className="book-card__recommendation-tags">
              {recommendationMeta.labels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <strong className="book-card__recommendation-score">
              {recommendationMeta.matchedCount} з{" "}
              {recommendationMeta.selectedCount} збігів
            </strong>
          </div>
        )}

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
    </AppPanel>
  );
};

export default memo(BookCard);
