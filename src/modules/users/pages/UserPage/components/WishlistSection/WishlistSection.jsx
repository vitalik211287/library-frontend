import { useNavigate } from "react-router-dom";
import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";

import "../ProfileBooks.css";

import "./WishlistSection.css";
import Icon from "../../../../../../shared/components/Icon/Icon.jsx";

const WishlistSection = ({
  books = [],
  isLoading = false,
  error = "",
  removeFromWishlist,
  onOpenReading,
}) => {
  const navigate = useNavigate();

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

    onOpenReading?.(book.id, book.sourceLibrary?.id ?? null);
  };

  const handleRemoveFromWishlist = async (event, bookId) => {
    event.stopPropagation();

    await removeFromWishlist(bookId);
  };

  return (
    <AppPanel as="section" className="profile-section profile-section--books">
      <div className="profile-section__header">
        <h2>Хочу прочитати</h2>

        {books.length > 0 && (
          <button type="button" onClick={handleOpenAll}>
            Переглянути всі
            <Icon name="chevron-right" />
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
                    <img src={book.coverUrl} alt={book.title} loading="lazy" decoding="async" />
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
                  <Icon name="bookmark" />
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
    </AppPanel>
  );
};

export default WishlistSection;
