import useWishlist from "../../hooks/useWishlist.js";

import "./WishlistSection.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />
  </svg>
);

const WishlistSection = ({ onCountChange }) => {
  const { books, isLoading, error, removeFromWishlist } = useWishlist({
    onCountChange,
  });

  return (
    <section className="profile-section">
      <div className="profile-section__header">
        <h2>Хочу прочитати</h2>

        {books.length > 0 && (
          <button type="button">
            Переглянути всі
            <ArrowIcon />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="profile-empty">Завантаження...</div>
      ) : error ? (
        <div className="profile-empty">{error}</div>
      ) : books.length === 0 ? (
        <div className="profile-empty">Список поки порожній</div>
      ) : (
        <div className="profile-books">
          {books.map((book) => (
            <article className="profile-book" key={book.id}>
              <div className="profile-book__cover">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} />
                ) : (
                  <div className="book-no-cover">
                    Немає
                    <br />
                    обкладинки
                  </div>
                )}

                {book.sourceLibrary && (
                  <span className="profile-book__library-badge">
                    {book.sourceLibrary.name}
                  </span>
                )}

                <button
                  type="button"
                  className="profile-book__bookmark"
                  onClick={() => removeFromWishlist(book.id)}
                  aria-label="Прибрати зі списку бажань"
                  title="Прибрати зі списку бажань"
                >
                  <BookmarkIcon />
                </button>
              </div>

              <h3>{book.title}</h3>

              <p>{book.author}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default WishlistSection;
