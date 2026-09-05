import { useNavigate, useSearchParams } from "react-router-dom";

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

const WishlistSection = ({
  books = [],
  isLoading = false,
  error = "",
  removeFromWishlist,
}) => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();


  const handleOpenAll = () => {
    navigate("/wishlist");

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });
  };

  const handleOpenBook = (book) => {
    if (!book?.id) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set("reading", book.id);

    if (book.sourceLibrary?.id) {
      params.set("readingLibrary", book.sourceLibrary.id);
    } else {
      params.delete("readingLibrary");
    }

    setSearchParams(params);
  };

  const handleRemoveFromWishlist = async (event, bookId) => {
    event.stopPropagation();

    await removeFromWishlist(bookId);
  };

  return (
    <section className="profile-section profile-section--books">
      <div className="profile-section__header">
        <h2>Хочу прочитати</h2>

        {books.length > 0 && (
          <button type="button" onClick={handleOpenAll}>
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
                <button
                  type="button"
                  className="profile-book__open"
                  onClick={() => handleOpenBook(book)}
                  aria-label={`Відкрити книгу «${book.title}»`}
                  title="Відкрити книгу"
                >
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} />
                  ) : (
                    <div className="book-no-cover">
                      Немає
                      <br />
                      обкладинки
                    </div>
                  )}
                </button>

                {book.sourceLibrary && (
                  <span className="profile-book__library-badge">
                    {book.sourceLibrary.name}
                  </span>
                )}

                <button
                  type="button"
                  className="profile-book__bookmark"
                  onClick={(event) => handleRemoveFromWishlist(event, book.id)}
                  aria-label="Прибрати зі списку бажань"
                  title="Прибрати зі списку бажань"
                >
                  <BookmarkIcon />
                </button>
              </div>

              <h3>
                <button
                  type="button"
                  className="profile-book__title-button"
                  onClick={() => handleOpenBook(book)}
                >
                  {book.title}
                </button>
              </h3>

              <p>{book.author}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default WishlistSection;

